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
  musicTrack?: MusicTrack;
  isPlaying?: boolean;
  isEditing?: boolean;
  isOwner?: boolean;
  onTogglePlay?: () => void;
  onPrevTrack?: () => void;
  onNextTrack?: () => void;
  onFavoriteTrack?: () => void;
  onShowPlaylist?: () => void;
  onAddMusic?: () => void;
  onRemovePin?: (position: number) => void;
}

const WidgetBoard: React.FC<WidgetBoardProps> = ({
  pinnedPosts = [],
  musicTrack,
  isPlaying = false,
  isEditing = false,
  isOwner = false,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onFavoriteTrack,
  onShowPlaylist,
  onAddMusic,
  onRemovePin
}) => {
  // Create an array of 4 cells, filling with pinnedPosts where available
  const gridCells = Array(4).fill(null).map((_, index) => {
    return pinnedPosts.find(post => post.position === index) || null;
  });

  // Audio element reference for music playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect to handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
          // In a real app, we would handle this error and possibly update UI state
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, musicTrack]);

  return (
    <div className="mb-4">
      {/* Hidden audio element for music playback */}
      {musicTrack && (
        <audio 
          ref={audioRef}
          src={musicTrack.url}
          loop
          preload="metadata"
          onEnded={() => onNextTrack && onNextTrack()}
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
                // If we have a post, render its content
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
                  
                  {/* Remove button when editing */}
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
                // If no post, show empty state or add button for owner
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

        {/* Music Player */}
        <div className="bg-blue-500 p-3 flex items-center justify-between">
          {/* Track Info */}
          <div className="text-white text-sm truncate flex-1">
            {musicTrack ? (
              `${musicTrack.artist} - ${musicTrack.title}`
            ) : (
              isOwner ? (
                <button 
                  onClick={onAddMusic} 
                  className="text-white/80 hover:text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add background music
                </button>
              ) : ""
            )}
          </div>

          {/* Player Controls */}
          {musicTrack && (
            <div className="flex items-center space-x-4 text-white">
              <button onClick={onFavoriteTrack} className="hover:text-white/80 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
              <button onClick={onPrevTrack} className="hover:text-white/80 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>
              <button onClick={onTogglePlay} className="hover:text-white/80 focus:outline-none">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              <button onClick={onNextTrack} className="hover:text-white/80 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
              <button onClick={onShowPlaylist} className="hover:text-white/80 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetBoard;
