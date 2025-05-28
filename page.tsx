"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import WidgetBoard from '@/components/WidgetBoard';
import { MoreHorizontal, Edit, MessageCircle, Repeat, Heart, Image as ImageIcon, Video, List as ListIcon, Link as LinkIcon, Music, Loader } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { agent, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User profile data
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<any[]>([]);
  
  // Music player state (placeholder for now)
  const [musicTrack, setMusicTrack] = useState({
    id: 'track1',
    title: 'Example Track',
    artist: 'Example Artist',
    url: 'https://example.com/music/track1.mp3',
    source: 'direct_url'
  });
  const [playlist, setPlaylist] = useState([
    {
      id: 'track1',
      title: 'Example Track',
      artist: 'Example Artist',
      url: 'https://example.com/music/track1.mp3',
      source: 'direct_url'
    },
    {
      id: 'track2',
      title: 'Another Track',
      artist: 'Example Artist',
      url: 'https://example.com/music/track2.mp3',
      source: 'direct_url'
    },
    {
      id: 'track3',
      title: 'Third Track',
      artist: 'Different Artist',
      url: 'https://example.com/music/track3.mp3',
      source: 'direct_url'
    }
  ]);
  
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPostForPin, setSelectedPostForPin] = useState<string | null>(null);
  
  // Determine if the current user is the profile owner
  const isOwner = true; // This will always be true since we're showing the authenticated user's profile

  const tabs = ['Posts', 'Replies', 'Media', 'Videos', 'Likes', 'Feeds'];

  // Fetch user profile and posts when authenticated
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !agent) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get the authenticated user's DID
        const session = await agent.getSession();
        const userDID = session.did;

        // Fetch the user's profile
        const profileResponse = await agent.getProfile({ actor: userDID });
        setProfile(profileResponse.data);

        // Fetch the user's posts
        const postsResponse = await agent.getAuthorFeed({ actor: userDID, limit: 20 });
        setPosts(postsResponse.data.feed);

        // Check for pinned posts if available in the profile
        if (profileResponse.data.pinnedPosts && profileResponse.data.pinnedPosts.length > 0) {
          setPinnedPosts(profileResponse.data.pinnedPosts);
        }

        console.log('Profile data loaded successfully');
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, agent]);

  // Handler for toggling music playback
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the actual audio playback
  };

  // Handler for previous track
  const handlePrevTrack = () => {
    const currentIndex = playlist.findIndex(track => track.id === musicTrack.id);
    if (currentIndex > 0) {
      setMusicTrack(playlist[currentIndex - 1]);
    } else {
      // Wrap around to the last track
      setMusicTrack(playlist[playlist.length - 1]);
    }
  };

  // Handler for next track
  const handleNextTrack = () => {
    const currentIndex = playlist.findIndex(track => track.id === musicTrack.id);
    if (currentIndex < playlist.length - 1) {
      setMusicTrack(playlist[currentIndex + 1]);
    } else {
      // Wrap around to the first track
      setMusicTrack(playlist[0]);
    }
  };

  // Handler for pinning/unpinning posts
  const handlePinPost = async (postId: string, position: number) => {
    if (!agent || !isAuthenticated) return;

    try {
      // In a real implementation, this would call the BlueSky API to pin the post
      // For now, we'll just update the local state
      const postToPin = posts.find(post => post.post.uri.includes(postId));
      if (!postToPin) return;

      // Create a new pinned post entry
      const newPinnedPost = {
        uri: postToPin.post.uri,
        cid: postToPin.post.cid,
        position,
        content: postToPin.post.record
      };

      // Update the pinnedPosts state
      const updatedPinnedPosts = [...pinnedPosts];
      
      // Check if there's already a post at this position
      const existingIndex = updatedPinnedPosts.findIndex(p => p.position === position);
      if (existingIndex >= 0) {
        // Replace the existing post
        updatedPinnedPosts[existingIndex] = newPinnedPost;
      } else {
        // Add the new post
        updatedPinnedPosts.push(newPinnedPost);
      }

      setPinnedPosts(updatedPinnedPosts);
      setShowPinModal(false);
      setSelectedPostForPin(null);
    } catch (err) {
      console.error('Error pinning post:', err);
      setError('Failed to pin post. Please try again later.');
    }
  };

  // Handler for removing a pinned post
  const handleUnpinPost = async (position: number) => {
    if (!agent || !isAuthenticated) return;

    try {
      // In a real implementation, this would call the BlueSky API to unpin the post
      // For now, we'll just update the local state
      setPinnedPosts(pinnedPosts.filter(post => post.position !== position));
    } catch (err) {
      console.error('Error unpinning post:', err);
      setError('Failed to unpin post. Please try again later.');
    }
  };

  // Handler for adding music
  const handleAddMusic = () => {
    if (isOwner) {
      setShowMusicModal(true);
    }
  };

  // Format the creation date
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}w`;
    return `${diffMonths}mo`;
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <AppLayout currentPage="profile" showHeader={true} showSidebarButton={true}>
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
          <Loader size={32} className="animate-spin mb-4" />
          <p>Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout currentPage="profile" showHeader={true} showSidebarButton={true}>
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !agent) {
    return (
      <AppLayout currentPage="profile" showHeader={true} showSidebarButton={true}>
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
          <p className="mb-4">Please sign in to view your profile</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="profile" showHeader={true} showSidebarButton={true}>
      <div className="bg-black text-white min-h-full">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-40 bg-gray-700">
            {profile?.banner && (
              <Image 
                src={profile.banner} 
                alt="Profile Banner" 
                layout="fill" 
                objectFit="cover" 
              />
            )}
          </div>
          <div className="absolute -bottom-12 left-4">
            <Image 
              src={profile?.avatar || "/shapes_logo.jpeg"} 
              alt={`${profile?.displayName || 'User'}'s avatar`} 
              width={96} 
              height={96} 
              className="rounded-full border-4 border-black" 
            />
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75">
              <MoreHorizontal size={20} />
            </button>
            <button 
              className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-gray-200"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-4 pb-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">{profile?.displayName || 'User'}</h1>
          <p className="text-sm text-gray-500">@{profile?.handle || 'username.bsky.social'}</p>
          <div className="flex space-x-1 text-sm text-gray-400 mt-1">
            <span>{profile?.followersCount || 0} followers</span>
            <span>&bull;</span>
            <span>{profile?.followsCount || 0} following</span>
            <span>&bull;</span>
            <span>{profile?.postsCount || 0} posts</span>
          </div>
          <p className="text-sm mt-2 whitespace-pre-wrap">
            {profile?.description || 'No bio provided'}
          </p>
          {profile?.labels && profile.labels.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-flex items-center">
              <LinkIcon size={12} className="mr-1" />
              {profile.labels.length} labels have been placed on this account
            </div>
          )}
        </div>

        {/* Tabs for Profile Content */}
        <div className="h-12 flex items-center px-2 border-b border-gray-800 sticky top-14 bg-black z-20 overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`py-2 px-3 text-sm font-medium hover:bg-gray-800 rounded-md mr-1 ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Widget Board */}
        <WidgetBoard 
          pinnedPosts={pinnedPosts}
          musicTrack={musicTrack}
          isPlaying={isPlaying}
          isEditing={isEditing}
          isOwner={isOwner}
          onTogglePlay={handleTogglePlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onFavoriteTrack={() => console.log('Favorite track')}
          onShowPlaylist={() => setShowMusicModal(true)}
          onAddMusic={handleAddMusic}
          onRemovePin={handleUnpinPost}
        />

        {/* Tab Content */}
        <div className="divide-y divide-gray-800">
          {activeTab === 'Posts' && posts.length > 0 && posts.map((feedItem) => {
            const post = feedItem.post;
            const postRecord = post.record;
            
            return (
              <article key={post.uri} className="p-4 hover:bg-gray-900/50 transition-colors duration-150">
                <div className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <Image 
                      src={feedItem.author.avatar || "/shapes_logo.jpeg"} 
                      alt={`${feedItem.author.displayName}'s avatar`} 
                      width={48} 
                      height={48} 
                      className="rounded-full" 
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-1">{feedItem.author.displayName}</span>
                      <span className="text-gray-500 mr-1">@{feedItem.author.handle}</span>
                      <span className="text-gray-500">&bull; {formatDate(post.indexedAt)}</span>
                      <div className="ml-auto flex items-center">
                        {isOwner && isEditing && (
                          <button 
                            className="text-blue-400 text-xs mr-2 hover:underline"
                            onClick={() => {
                              setSelectedPostForPin(post.uri);
                              setShowPinModal(true);
                            }}
                          >
                            Pin to Widget
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-gray-300">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{postRecord.text}</p>
                    
                    {/* External link preview */}
                    {postRecord.embed?.external && (
                      <div className="mt-2 border border-gray-700 rounded-lg p-3 hover:bg-gray-800">
                        <p className="text-sm font-semibold">{postRecord.embed.external.title}</p>
                        <p className="text-xs text-gray-400">{postRecord.embed.external.description}</p>
                        <p className="text-xs text-blue-400 mt-1">{new URL(postRecord.embed.external.uri).hostname}</p>
                      </div>
                    )}
                    
                    {/* Images */}
                    {postRecord.embed?.images && postRecord.embed.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {postRecord.embed.images.map((image: any, index: number) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image 
                              src={image.fullsize} 
                              alt={image.alt || "Post image"} 
                              layout="fill" 
                              objectFit="cover" 
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hashtags */}
                    {postRecord.tags && postRecord.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {postRecord.tags.map((tag: string) => (
                          <span key={tag} className="text-blue-400 text-sm hover:underline cursor-pointer">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div 
(Content truncated due to size limit. Use line ranges to read in chunks)