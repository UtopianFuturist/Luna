"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, getAuthorFeed, FeedViewPost, FeedPage } from '@/lib/bskyService'; // Added getAuthorFeed, FeedViewPost, FeedPage
import type { AppBskyActorDefs, AppBskyEmbedImages, AppBskyEmbedExternal, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyRichtextFacet } from '@atproto/api'; // Added embed types
import { User, Users, ListChecks, LayoutList, Image as ImageIconLucide, MessageSquare, Edit3, UserPlus, UserCheck } from 'lucide-react';
import { processFacets } from '@/utils/richtextProcessor';

type ProfilePageTab = 'posts' | 'replies_and_posts' | 'media' | 'feeds' | 'lists';

// Basic Embed Components (copied from feeds/page.tsx for now, ideally refactor)
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
        {thumb && ( <div className="w-24 h-24 relative flex-shrink-0"><Image src={thumb} alt={title || 'External link preview'} layout="fill" objectFit="cover" className="rounded-l-lg" /></div> )}
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
        <p className="text-xs text-gray-400 truncate_lines_3">{typeof record.value?.text === 'string' ? record.value.text : '(Quoted post content not available)'}</p>
        <Link href={`/profile/${record.author.handle}/post/${record.uri.split('/').pop()}`} legacyBehavior><a className="text-xs text-blue-400 hover:underline mt-1 inline-block">View quoted post</a></Link>
      </div>
    );
  }
  return <p className="text-xs text-gray-500 mt-2">(Unsupported quoted content)</p>;
};


const BlueSkyProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { agent, isAuthenticated, session } = useAuth();
  const actorIdentifier = typeof params.actor === 'string' ? decodeURIComponent(params.actor) : null;

  const [profile, setProfile] = useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfilePageTab>('posts');

  const [authorPosts, setAuthorPosts] = useState<FeedViewPost[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsCursor, setPostsCursor] = useState<string | undefined>(undefined);

  const currentAgent = isAuthenticated ? agent : new (require('@atproto/api').BskyAgent)({ service: 'https://public.api.bsky.app' });


  useEffect(() => {
    if (actorIdentifier && currentAgent) { // Use currentAgent that could be public or authenticated
      setIsLoadingProfile(true);
      setProfileError(null);
      getProfile(currentAgent, actorIdentifier)
        .then(data => setProfile(data))
        .catch(err => {
          setProfileError(`Failed to load profile: ${err instanceof Error ? err.message : "Unknown error"}`);
        })
        .finally(() => setIsLoadingProfile(false));
    } else if (!actorIdentifier) {
      setProfileError("No profile identifier provided.");
      setIsLoadingProfile(false);
    }
  }, [actorIdentifier, currentAgent]); // currentAgent will change with auth state

  const fetchAuthorPosts = useCallback(async (loadMore = false) => {
    if (!actorIdentifier || !currentAgent) return;

    setPostsLoading(!loadMore);
    if (loadMore) setPostsLoading(posts.length > 0); // Keep showing posts while loading more
    else setAuthorPosts([]); // Clear for fresh tab load

    setPostsError(null);
    const currentPostsCursor = loadMore ? postsCursor : undefined;

    try {
      const data: FeedPage = await getAuthorFeed(currentAgent, actorIdentifier, currentPostsCursor, 25);
      setAuthorPosts(prev => loadMore ? [...prev, ...data.feed] : data.feed);
      setPostsCursor(data.cursor);
    } catch (err) {
      setPostsError(`Failed to load posts: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setPostsLoading(false);
    }
  }, [actorIdentifier, currentAgent, postsCursor, posts.length]); // Added posts.length to deps

  useEffect(() => {
    if (activeTab === 'posts' && actorIdentifier && currentAgent) {
      fetchAuthorPosts(); // Initial fetch for posts tab
    }
    // Add similar useEffects for other tabs when their fetching logic is added
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, actorIdentifier, currentAgent]); // fetchAuthorPosts removed from deps


  const renderRichText = (text: string, facets?: AppBskyRichtextFacet.Main[]) => {
    const segments = processFacets(text, facets);
    return segments.map((segment, index) => {
      if (segment.type === 'link') return <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{segment.content}</a>;
      if (segment.type === 'mention') return <Link key={index} href={segment.href || '#'} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      if (segment.type === 'tag') return <Link key={index} href={`/tags/${segment.tag}`} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      return <React.Fragment key={index}>{segment.content}</React.Fragment>;
    });
  };

  const renderEmbed = (embed: FeedViewPost['post']['embed']) => {
    if (!embed) return null;
    if (AppBskyEmbedImages.isView(embed)) return <ImageEmbedDisplay imagesView={embed} />;
    if (AppBskyEmbedExternal.isView(embed)) return <ExternalEmbedDisplay externalView={embed} />;
    if (AppBskyEmbedRecord.isView(embed)) return <RecordEmbedDisplay recordView={embed} />;
    if (AppBskyEmbedRecordWithMedia.isView(embed)) return (<div>{AppBskyEmbedRecord.isView(embed.record) && <RecordEmbedDisplay recordView={embed.record} />}{(AppBskyEmbedImages.isView(embed.media) || AppBskyEmbedExternal.isView(embed.media)) && renderEmbed(embed.media)}</div>);
    return <p className="text-xs text-gray-500 mt-2">(Unsupported embed type)</p>;
  };

  const renderPostItem = (item: FeedViewPost) => {
    const { post, reason, reply } = item;
    if (!post.record) return null;
    return (
      <div key={post.uri} className="p-4 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
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
            <div className="text-gray-200 mt-1 whitespace-pre-wrap break-words">{renderRichText(typeof post.record.text === 'string' ? post.record.text : '', post.record.facets)}</div>
            {renderEmbed(post.embed)}
            <div className="flex space-x-4 text-gray-500 mt-3 text-xs"><span>Replies: {post.replyCount || 0}</span><span>Reposts: {post.repostCount || 0}</span><span>Likes: {post.likeCount || 0}</span></div>
          </div>
        </div>
      </div>
    );
  };

  const renderDescription = () => {
    if (!profile?.description) return null;
    const segments = processFacets(profile.description, profile.descriptionFacets as AppBskyRichtextFacet.Main[] | undefined); // Cast as facets can be undefined
    return segments.map((segment, index) => {
      if (segment.type === 'link') return <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{segment.content}</a>;
      if (segment.type === 'mention') return <Link key={index} href={segment.href || '#'} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      if (segment.type === 'tag') return <Link key={index} href={`/tags/${segment.tag?.replace(/^#/, '')}`} legacyBehavior><a className="text-blue-400 hover:underline">{segment.content}</a></Link>;
      return <React.Fragment key={index}>{segment.content}</React.Fragment>;
    });
  };

  const TabButton: React.FC<{tabId: ProfilePageTab, currentTab: ProfilePageTab, label: string, icon?: React.ReactNode}> = ({tabId, currentTab, label, icon}) => (
    <button onClick={() => setActiveTab(tabId)} className={`flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${currentTab === tabId ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>{icon}<span>{label}</span></button>
  );

  if (isLoadingProfile) return <AppLayout currentPage="Profile" showHeader={true}><div className="p-4 text-center text-white">Loading profile...</div></AppLayout>;
  if (profileError) return <AppLayout currentPage="Error" showHeader={true}><div className="p-4 text-center text-red-400">Error: {profileError}</div></AppLayout>;
  if (!profile) return <AppLayout currentPage="Profile Not Found" showHeader={true}><div className="p-4 text-center text-white">Profile not found.</div></AppLayout>;

  const isOwnProfile = profile.did === session?.did;

  return (
    <AppLayout currentPage={profile.displayName || `@${profile.handle}`} showHeader={true} showSidebarButton={true}>
      <div className="text-white">
        <div className="relative">
          {profile.banner ? <Image src={profile.banner} alt="Banner" width={1200} height={300} objectFit="cover" className="w-full h-48 md:h-64 object-cover" /> : <div className="w-full h-48 md:h-64 bg-gray-700"></div>}
          <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-6">
            {profile.avatar ? <Image src={profile.avatar} alt="Avatar" width={100} height={100} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-gray-800" /> : <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-gray-700 flex items-center justify-center"><User size={48} className="text-gray-400"/></div>}
          </div>
        </div>
        <div className="pt-16 md:pt-20 px-4 md:px-6 pb-4">
          <div className="flex justify-end mb-3">
            {isOwnProfile ? (<Link href="/bsky-settings" legacyBehavior><a className="px-4 py-1.5 text-sm border border-gray-600 rounded-full hover:bg-gray-700 transition-colors flex items-center space-x-1.5"><Edit3 size={14}/> <span>Edit Profile & Settings</span></a></Link>) : (<button className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 rounded-full flex items-center space-x-1.5">{profile.viewer?.following ? <UserCheck size={14}/> : <UserPlus size={14}/>}<span>{profile.viewer?.following ? 'Following' : 'Follow'}</span></button>)}
          </div>
          <div><h1 className="text-2xl font-bold">{profile.displayName || profile.handle}</h1><p className="text-sm text-gray-400">@{profile.handle}</p></div>
          {profile.description && (<div className="mt-2 text-sm text-gray-300 max-w-xl whitespace-pre-wrap break-words">{renderDescription()}</div>)}
          <div className="mt-3 flex space-x-4 text-sm text-gray-400"><span><span className="font-bold text-gray-200">{profile.followersCount}</span> Followers</span><span><span className="font-bold text-gray-200">{profile.followsCount}</span> Following</span><span><span className="font-bold text-gray-200">{profile.postsCount}</span> Posts</span></div>
        </div>
        <div className="border-b border-gray-700 flex overflow-x-auto scrollbar-hide">
          <TabButton tabId="posts" currentTab={activeTab} label="Posts" icon={<LayoutList size={16}/>} />
          <TabButton tabId="replies_and_posts" currentTab={activeTab} label="Posts & Replies" icon={<MessageSquare size={16}/>} />
          <TabButton tabId="media" currentTab={activeTab} label="Media" icon={<ImageIconLucide size={16}/>} />
          <TabButton tabId="feeds" currentTab={activeTab} label="Feeds" icon={<Users size={16}/>} />
          <TabButton tabId="lists" currentTab={activeTab} label="Lists" icon={<ListChecks size={16}/>} />
        </div>
        <div className="min-h-[300px]"> {/* Added min-height to prevent jumpiness during loading tab content */}
          {activeTab === 'posts' && (
            postsLoading && authorPosts.length === 0 ? <div className="p-4 text-center">Loading posts...</div> :
            postsError ? <div className="p-4 text-red-400 text-center">Error: {postsError}</div> :
            authorPosts.length === 0 ? <div className="p-4 text-center text-gray-400">No posts yet.</div> :
            <>
              <div className="divide-y divide-gray-700/30">{authorPosts.map(item => renderPostItem(item))}</div>
              {postsCursor && !postsLoading && (<div className="p-4 flex justify-center"><button onClick={() => fetchAuthorPosts(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold">Load More</button></div>)}
              {!postsCursor && !postsLoading && authorPosts.length > 0 && (<div className="p-4 text-center text-xs text-gray-500">End of posts.</div>)}
            </>
          )}
          {activeTab === 'replies_and_posts' && <div className="text-center py-8 text-gray-400">Posts and replies will appear here. (Fetching not yet implemented)</div>}
          {activeTab === 'media' && <div className="text-center py-8 text-gray-400">Media posts will appear here. (Fetching not yet implemented)</div>}
          {activeTab === 'feeds' && <div className="text-center py-8 text-gray-400">User's feeds will appear here. (Fetching not yet implemented)</div>}
          {activeTab === 'lists' && <div className="text-center py-8 text-gray-400">User's lists will appear here. (Fetching not yet implemented)</div>}
        </div>
      </div>
    </AppLayout>
  );
};

export default BlueSkyProfilePage;
