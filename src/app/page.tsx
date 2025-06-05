"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Removed useSearchParams as we'll set a default feed
import Image from 'next/image';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout'; // Assuming AppLayout is in src/components
import { useAuth } from '../../AuthContext'; // Assuming AuthContext is at the root
import { getFeed, FeedPage, FeedViewPost } from '@/lib/bskyService'; // Assuming bskyService is in src/lib
import { processFacets } from '@/utils/richtextProcessor'; // Assuming richtextProcessor is in src/utils
import { AppBskyEmbedImages, AppBskyEmbedExternal, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyRichtextFacet } from '@atproto/api';

// Embed Components (copied from src/app/feeds/page.tsx)
const ImageEmbedDisplay: React.FC<{ imagesView: AppBskyEmbedImages.View }> = ({ imagesView }) => {
  if (!imagesView.images || imagesView.images.length === 0) return null;
  return (
    <div className={`mt-2 grid grid-cols-${imagesView.images.length === 1 ? 1 : 2} gap-2`}>
      {imagesView.images.map(img => (
        <div key={img.thumb} className="relative aspect-[16/9] bg-gray-700 rounded-md overflow-hidden border border-gray-600">
          <a href={img.fullsize} target="_blank" rel="noopener noreferrer" aria-label={`View image: ${img.alt || 'Embedded image'}`}>
            <Image src={img.thumb} alt={img.alt || 'Embedded image'} layout="fill" objectFit="cover" />
          </a>
        </div>
      ))}
    </div>
  );
};

const ExternalEmbedDisplay: React.FC<{ externalView: AppBskyEmbedExternal.View }> = ({ externalView }) => {
  const { uri, title, description, thumb } = externalView.external;
  return (
    <a href={uri} target="_blank" rel="noopener noreferrer" className="mt-2 block border border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
      <div className="flex">
        {thumb && (
          <div className="w-24 h-24 relative flex-shrink-0">
            <Image src={thumb} alt={title || 'External link preview'} layout="fill" objectFit="cover" className="rounded-l-lg" />
          </div>
        )}
        <div className="p-3 overflow-hidden">
          <p className="text-sm font-semibold text-gray-200 truncate">{title || uri}</p>
          <p className="text-xs text-gray-400 truncate_lines_2">{description}</p>
          <p className="text-xs text-blue-400 truncate mt-1">{uri}</p>
        </div>
      </div>
    </a>
  );
};

const RecordEmbedDisplay: React.FC<{ recordView: AppBskyEmbedRecord.View }> = ({ recordView }) => {
  if (AppBskyEmbedRecord.isViewRecord(recordView.record)) {
    const record = recordView.record;
    return (
      <div className="mt-2 p-2 border border-gray-600 rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          {record.author.avatar && <Image src={record.author.avatar} alt="avatar" width={16} height={16} className="rounded-full" />}
          <span className="text-xs font-semibold text-gray-300">{record.author.displayName || `@${record.author.handle}`}</span>
        </div>
        <p className="text-xs text-gray-400 truncate_lines_3">
            {typeof record.value?.text === 'string' ? record.value.text : '(Quoted post content not available or is not text-based)'}
        </p>
        <Link href={`/profile/${record.author.handle}/post/${record.uri.split('/').pop()}`} legacyBehavior>
          <a className="text-xs text-blue-400 hover:underline mt-1 inline-block">View quoted post</a>
        </Link>
      </div>
    );
  }
  return <p className="text-xs text-gray-500 mt-2">(Unsupported quoted content)</p>;
};
// End Embed Components

const HomePage: React.FC = () => {
  const { agent, isAuthenticated, session } = useAuth(); // Added session to get user's DID

  // State for the default "Following" feed URI
  const [feedUri, setFeedUri] = useState<string | null>(null);

  const [posts, setPosts] = useState<FeedViewPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && agent?.session?.did) {
      // Construct the "Following" feed URI for the logged-in user
      const defaultFollowingUri = `at://${agent.session.did}/app.bsky.feed.generator/home`;
      setFeedUri(defaultFollowingUri);
    } else if (!isAuthenticated && !isLoading) {
        // If not authenticated and not already loading session state,
        // this page shouldn't be shown (ProtectedRoute would redirect).
        // But if somehow reached, indicate to log in.
        setError("Please log in to view your feed.");
        setIsLoading(false);
    }
    // If isLoading (from useAuth) is true, we wait for session to resolve.
  }, [isAuthenticated, agent, isLoading]); // Depend on isLoading from useAuth

  const fetchPosts = useCallback(async (loadMore = false) => {
    if (!agent || !feedUri || !isAuthenticated) {
      // This condition might be redundant if ProtectedRoute works, but good for safety.
      if (!isAuthenticated) setError("Please log in to view feeds.");
      if (!feedUri && isAuthenticated) setError("Feed URI not set."); // Should be set by useEffect
      return;
    }

    if (!loadMore) {
      setIsLoading(true);
      // Only clear posts if not loading more and feedUri is definitively set.
      // This avoids clearing posts if feedUri is temporarily null during init.
      if(feedUri) setPosts([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    const currentCursorToUse = loadMore ? cursor : undefined;

    try {
      const response: FeedPage = await getFeed(agent, feedUri, currentCursorToUse, 25);
      setPosts(prev => loadMore ? [...prev, ...response.feed] : response.feed);
      setCursor(response.cursor);
    } catch (err) {
      console.error("Error fetching home feed:", err);
      setError(err instanceof Error ? err.message : "Unknown error fetching feed.");
    } finally {
      if (!loadMore) setIsLoading(false); else setIsLoadingMore(false);
    }
  }, [agent, feedUri, cursor, isAuthenticated]);

  useEffect(() => {
    // Fetch posts only if we have a feedUri, agent, and user is authenticated.
    // This will trigger once feedUri is set from the first useEffect.
    if (feedUri && agent && isAuthenticated) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedUri, agent, isAuthenticated]); // Removed fetchPosts from deps to avoid re-triggering on its own change

  const renderRichText = (text: string, facets?: AppBskyRichtextFacet.Main[]) => {
    if (!facets) facets = []; // Ensure facets is an array
    const segments = processFacets(text, facets);
    return segments.map((segment, index) => {
      if (segment.type === 'link') {
        return <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{segment.content}</a>;
      } else if (segment.type === 'mention') {
        return <Link key={index} href={segment.href || '#'} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      } else if (segment.type === 'tag') {
        return <Link key={index} href={`/tags/${segment.tag}`} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      }
      return <React.Fragment key={index}>{segment.content}</React.Fragment>;
    });
  };

  const renderEmbed = (embed: FeedViewPost['post']['embed']) => {
    if (!embed) return null;
    if (AppBskyEmbedImages.isView(embed)) {
      return <ImageEmbedDisplay imagesView={embed} />;
    } else if (AppBskyEmbedExternal.isView(embed)) {
      return <ExternalEmbedDisplay externalView={embed} />;
    } else if (AppBskyEmbedRecord.isView(embed)) {
      return <RecordEmbedDisplay recordView={embed} />;
    } else if (AppBskyEmbedRecordWithMedia.isView(embed)) {
      return (
        <div>
          {AppBskyEmbedRecord.isView(embed.record) && <RecordEmbedDisplay recordView={embed.record} />}
          {(AppBskyEmbedImages.isView(embed.media) || AppBskyEmbedExternal.isView(embed.media)) && renderEmbed(embed.media)}
        </div>
      );
    }
    return <p className="text-xs text-gray-500 mt-2">(Unsupported embed type)</p>;
  };

  const renderPost = (item: FeedViewPost) => {
    const { post, reason, reply } = item;
    if (!post.record) return null;

    return (
      <div key={post.uri} className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
        {reason && reason.$type === 'app.bsky.feed.defs#reasonRepost' && ( <div className="text-xs text-gray-400 mb-1"> Reposted by <Link href={`/profile/${reason.by.handle}`} legacyBehavior><a className="hover:underline">{reason.by.displayName || `@${reason.by.handle}`}</a></Link> </div> )}
        {reply && 'parent' in reply && reply.parent && 'author' in reply.parent && ( <div className="text-xs text-gray-400 mb-1"> Replying to <Link href={`/profile/${(reply.parent as any).author?.handle}`} legacyBehavior><a className="hover:underline">{(reply.parent as any).author?.displayName || `@${(reply.parent as any).author?.handle}`}</a></Link> </div> )}
        <div className="flex space-x-3">
          {post.author.avatar && <Image src={post.author.avatar} alt={`${post.author.displayName || post.author.handle}'s avatar`} width={48} height={48} className="rounded-full bg-gray-600"/>}
          {!post.author.avatar && <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0"></div>}
          <div className="flex-1">
            <div className="flex items-center space-x-1 text-sm">
              <Link href={`/profile/${post.author.handle}`} legacyBehavior><a className="font-bold text-gray-100 hover:underline">{post.author.displayName || post.author.handle}</a></Link>
              <Link href={`/profile/${post.author.handle}`} legacyBehavior><a className="text-gray-400">@{post.author.handle}</a></Link>
              <span className="text-gray-500">·</span>
              <Link href={`/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`} legacyBehavior><a className="text-gray-500 hover:underline">{new Date(post.indexedAt).toLocaleDateString()}</a></Link>
            </div>
            <div className="text-gray-200 mt-1 whitespace-pre-wrap break-words">
              {renderRichText(typeof post.record.text === 'string' ? post.record.text : '', post.record.facets)}
            </div>
            {renderEmbed(post.embed)}
            <div className="flex space-x-4 text-gray-500 mt-3 text-xs">
              <span>Replies: {post.replyCount || 0}</span><span>Reposts: {post.repostCount || 0}</span><span>Likes: {post.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout currentPage="Home" showHeader={true} showSidebarButton={true}>
      <div className="text-white">
        {/* Removed the specific feed URI display, as this is the default home feed */}
        {/* <div className="p-4 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-700"><h1 className="text-lg font-semibold">Home Feed</h1></div> */}

        {(isLoading && posts.length === 0 && feedUri) && <div className="p-4 text-center">Loading your feed...</div>}
        {error && <div className="p-4 text-red-400 text-center">Error: {error}</div>}
        {posts.length === 0 && !isLoading && !error && feedUri && (<div className="p-4 text-center text-gray-400">Your feed is empty. Go explore and follow some accounts!</div>)}
        {!feedUri && !isLoading && !error && isAuthenticated && (<div className="p-4 text-center text-gray-400">Setting up your feed...</div>)}
        {!isAuthenticated && !isLoading && (<div className="p-4 text-center text-gray-400">Please sign in to see your feed.</div>)}

        <div className="divide-y divide-gray-700/50">{posts.map(item => renderPost(item))}</div>

        {cursor && !isLoadingMore && posts.length > 0 && (<div className="p-4 flex justify-center"><button onClick={() => fetchPosts(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold">Load More</button></div>)}
        {isLoadingMore && <div className="p-4 text-center">Loading more posts...</div>}
        {!cursor && posts.length > 0 && !isLoadingMore && (<div className="p-4 text-center text-gray-500">End of feed.</div>)}
      </div>
    </AppLayout>
  );
};

export default HomePage;
