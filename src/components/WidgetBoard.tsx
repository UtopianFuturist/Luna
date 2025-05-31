"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Pin } from 'lucide-react';
import Image from 'next/image';

// Define types for our component props
interface PinnedPost {
  uri: string;
  cid: string;
  position: number;
  content?: {
    text?: string;
    images?: string[];
    // Other content types as needed
  };
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  source: string;
}

interface WidgetBoardProps {
  pinnedPosts: PinnedPost[];
  musicTrack?: MusicTrack; // This might be deprecated or used differently
  isPlaying?: boolean;
  isEditing?: boolean;
  isOwner?: boolean;
  onTogglePlay?: () => void;
  // onPrevTrack, onNextTrack, onFavoriteTrack, onShowPlaylist might become less relevant for URL-based playback
  // onAddMusic will be removed as music is set via settings
  onRemovePin?: (position: number) => void;
}

// Helper function to determine embed type and URL
const getEmbedPlayer = (url: string): { type: string; src: string | null } => {
  if (!url) return { type: 'none', src: null };

  try {
    const urlObj = new URL(url); // Validate URL structure

    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = urlObj.searchParams.get('v');
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      }
      return videoId ? { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}` } : { type: 'none', src: null };
    }
    if (urlObj.hostname.includes('soundcloud.com')) {
      return { type: 'iframe', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&visual=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false` };
    }
    if (urlObj.pathname.match(/\.(mp3|wav|ogg|aac)$/i)) {
      return { type: 'audio', src: url };
    }
    if (urlObj.hostname.includes('spotify.com')) {
      // For Spotify, direct embedding is complex. We'll show a link or placeholder.
      // Real Spotify embeds often use their Web Playback SDK or specific iframe requirements.
      // Example: "https://open.spotify.com/embed/track/TRACK_ID"
      if (url.includes("/embed/")) { // Already an embed link
        return { type: 'iframe', src: url};
      }
      return { type: 'spotify', src: url };
    }
  } catch (e) {
    console.error("Error parsing URL for embedding:", e);
    return { type: 'none', src: null };
  }
  return { type: 'none', src: null }; // Default for unknown URLs
};


const WidgetBoard: React.FC<WidgetBoardProps> = ({
  pinnedPosts = [],
  // musicTrack, // Potentially remove or adapt if fully URL based
  isPlaying = false,
  isEditing = false,
  isOwner = false,
  onTogglePlay,
  // onPrevTrack, // Less relevant for single URL
  // onNextTrack, // Less relevant for single URL
  // onFavoriteTrack, // Less relevant for single URL
  // onShowPlaylist, // Less relevant for single URL
  onRemovePin
}) => {
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUrl = localStorage.getItem('profileMusicUrl');
      if (storedUrl) {
        setMusicUrl(storedUrl);
      }
    }
  }, []);

  const embedPlayer = musicUrl ? getEmbedPlayer(musicUrl) : null;

  // Effect to handle audio playback for <audio> tag
  useEffect(() => {
    if (embedPlayer?.type === 'audio' && audioRef.current) {
      if (isPlaying && embedPlayer.src) {
        audioRef.current.src = embedPlayer.src; // Ensure src is set before play
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, embedPlayer]);

  // Create an array of 4 cells, filling with pinnedPosts where available
  const gridCells = Array(4).fill(null).map((_, index) => {
    return pinnedPosts.find(post => post.position === index) || null;
  });

  return (
    <div className="mb-4">
      {/* Hidden audio element for direct audio links */}
      {embedPlayer?.type === 'audio' && embedPlayer.src && (
        <audio 
          ref={audioRef}
          // src={embedPlayer.src} // src is now set in useEffect to handle changes
          loop
          preload="metadata"
          // onEnded={() => onNextTrack && onNextTrack()} // onNextTrack might be removed
          className="hidden"
        />
      )}

      {/* Pinned Label */}
      <div className="flex items-center px-4 py-2 text-gray-500 text-sm">
        <Pin size={16} className="mr-1.5" />
        <span>Pinned</span>
      </div>

      {/* Widget Board Container */}
      <div className="mx-4 rounded-xl overflow-hidden border border-gray-800">
        {/* 2x2 Grid for Pinned Posts */}
        <div className="grid grid-cols-2 gap-2 p-2">
          {gridCells.map((post, index) => (
            <div 
              key={`cell-${index}`} 
              className="aspect-square bg-blue-500 rounded-lg flex items-center justify-center overflow-hidden relative"
            >
              {post ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  {post.content?.text ? (
                    <p className="text-sm p-2 line-clamp-4">{post.content.text}</p>
                  ) : post.content?.images && post.content.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={post.content.images[0]} 
                        alt="Pinned post image" 
                        fill 
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                  ) : (
                    <span>Pinned Content</span>
                  )}
                  {isOwner && isEditing && (
                    <button 
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                      onClick={() => onRemovePin && onRemovePin(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                isOwner && isEditing ? (
                  <button className="text-white text-sm flex items-center justify-center w-full h-full hover:bg-blue-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Post
                  </button>
                ) : (
                  <div className="text-white/50 text-xs">Empty</div>
                )
              )}
            </div>
          ))}
        </div>

        {/* Music Player Area */}
        <div className="bg-blue-500 p-3">
          {embedPlayer?.type === 'iframe' && embedPlayer.src && (
            <iframe
              src={embedPlayer.src}
              className="w-full h-20 md:h-24 border-none" // Adjust height as needed
              title="Music Player Embed"
              allow="encrypted-media; autoplay" // autoplay might be blocked by browsers
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
          )}
          {embedPlayer?.type === 'audio' && (
            <div className="flex items-center justify-between text-white">
              <div className="text-sm truncate flex-1">
                {musicUrl ? new URL(musicUrl).pathname.split('/').pop() : "Audio Track"}
              </div>
              {onTogglePlay && (
                <div className="flex items-center space-x-2">
                  {/* Simplified controls for audio tag */}
                  <button onClick={onTogglePlay} className="hover:text-white/80 focus:outline-none">
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
                  </button>
                  {/* Volume/Progress could be added back here if desired */}
                </div>
              )}
            </div>
          )}
          {embedPlayer?.type === 'spotify' && embedPlayer.src && (
            <div className="text-white text-sm p-2 text-center">
              Spotify link detected. <a href={embedPlayer.src} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Play on Spotify</a>.
              <p className="text-xs text-white/70 mt-1">(Full playback requires Spotify app or Web Player SDK integration)</p>
            </div>
          )}
          {(!musicUrl || embedPlayer?.type === 'none') && (
            <div className="text-white/70 text-sm text-center p-2">
              No background music configured. Set a URL in Profile Settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetBoard;
