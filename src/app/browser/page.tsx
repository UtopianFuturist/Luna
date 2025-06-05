"use client";

import React, { useState, useContext } from 'react'; // Added useContext
import AppLayout from '@/components/AppLayout';
import { BrowserAudioContext } from '../../contexts/BrowserAudioContext'; // Adjust path

const categorizedLinks = [
  {
    category: "AI Tools",
    links: [
      { name: "ChatGPT", url: "https://chat.openai.com" },
      { name: "Google Gemini", url: "https://gemini.google.com" },
      { name: "Anthropic Claude", url: "https://claude.ai" },
      { name: "WebSim", url: "https://websim.ai" },
      { "name": "Google Jules", "url": "https://ai.google/" }
    ],
  },
  {
    category: "Social",
    links: [
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Soundcloud", url: "https://soundcloud.com" },
      { name: "BlueSky", url: "https://bsky.app" },
      { name: "Discord", url: "https://discord.com/login" },
    ],
  },
  {
    category: "Payment",
    links: [
      { name: "CashApp", url: "https://cash.app" },
      { name: "Venmo", url: "https://venmo.com" },
      { name: "Zelle", url: "https://zellepay.com" },
      { name: "Paypal", url: "https://paypal.com" },
    ],
  },
  {
    category: "BlueSky Tools",
    links: [
      { name: "ClearSky", url: "https://clearsky.app.placeholder" },
      { name: "Graze Feed Builder", url: "https://graze.placeholder.url" }
    ]
  },
  {
    category: "Games",
    links: [
      { name: "Bored Button", url: "https://www.boredbutton.com" },
      { name: "Button Bass", url: "https://www.buttonbass.com" }
    ]
  }
];

// Helper function to determine embed type and URL for audio/video
const getEmbedAudioVideoUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = urlObj.searchParams.get('v');
      if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.substring(1);
      // Add autoplay=1 for immediate play in the persistent iframe
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }
    if (urlObj.hostname.includes('soundcloud.com')) {
      // Add autoplay=true, visual=false for background audio-like experience
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false`;
    }
    // Could add more specific audio/video embed handlers here if needed
  } catch (e) {
    console.error("Error parsing URL for audio/video embedding:", e);
    return null;
  }
  return null; // Not a special audio/video URL for custom embedding, will use original URL
};


const BrowserPage: React.FC = () => {
  const browserAudioCtx = useContext(BrowserAudioContext);

  if (!browserAudioCtx) {
    return <div>Loading audio context...</div>; // Or some other error/loading state
  }
  const { audioUrl: currentAudioUrl, setAudioUrl, setIsPlaying, isPlaying } = browserAudioCtx;

  const handleLinkSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    if (selectedUrl) {
      const specialEmbedUrl = getEmbedAudioVideoUrl(selectedUrl);
      if (specialEmbedUrl) {
        setAudioUrl(specialEmbedUrl);
      } else {
        // For general links, still set them on the audioUrl to be loaded in the persistent iframe
        // This makes the persistent iframe the main content viewer for this browser page.
        setAudioUrl(selectedUrl);
      }
      setIsPlaying(true);
    }
  };

  const handleStopAudio = () => {
    setAudioUrl(null); // Or set to "about:blank"
    setIsPlaying(false);
  };

  return (
    <AppLayout currentPage="Browser" showSidebarButton={true}>
      <div className="flex flex-col h-screen">
        <div className="p-4 bg-gray-900 text-white">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            {categorizedLinks.map((categoryGroup) => (
              <div key={categoryGroup.category} className="flex flex-col">
                <label htmlFor={`${categoryGroup.category}-select`} className="mb-1 text-sm font-medium text-gray-300">
                  {categoryGroup.category}:
                </label>
                <select
                  id={`${categoryGroup.category}-select`}
                  onChange={handleLinkSelection}
                  className="bg-gray-700 text-white p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue=""
                >
                  <option value="" disabled>Select a {categoryGroup.category.replace(/s$/, '')} link...</option>
                  {categoryGroup.links.map((link) => (
                    <option key={link.name} value={link.url}>
                      {link.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between_temp mb-2"> {/* temp class */}
            {currentAudioUrl && isPlaying && (
              <button
                onClick={handleStopAudio}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm"
              >
                Stop Audio/Video
              </button>
            )}
          </div>
          {currentAudioUrl && (
             <div className="text-xs text-gray-400 truncate p-2 bg-gray-800 rounded-md">
               Current source: {currentAudioUrl} {isPlaying ? "(Playing)" : "(Paused/Stopped)"}
             </div>
          )}
          {!currentAudioUrl && (
            <div className="text-center py-10 text-gray-500">
              <p>Select a link from the dropdowns above to start browsing or listening.</p>
              <p>The content will appear in a persistent player within the app layout.</p>
            </div>
          )}
        </div>
        {/* The main iframe for displaying content is now managed by AppLayout */}
        {/* This area can be used for additional controls or information if needed */}
        {/* Or it could be intentionally left blank if the AppLayout iframe is fullscreen on this page */}
         <div className="flex-grow bg-black">
          {/* This is a placeholder for where the iframe content *would* have been.
              Since the iframe is now in AppLayout, this page might not need its own large content area
              if the AppLayout iframe is meant to be the primary view here.
              If AppLayout iframe is a small mini-player, then this page would need its own iframe.
              The current setup makes AppLayout's iframe the main viewer on /browser.
          */}
        </div>
      </div>
    </AppLayout>
  );
};

export default BrowserPage;
