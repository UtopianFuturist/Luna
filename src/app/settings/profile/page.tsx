"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout'; // Assuming AppLayout is in src/components

const ProfileSettingsPage: React.FC = () => {
  const [musicUrlInput, setMusicUrlInput] = useState<string>("");

  // Load saved music URL from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('profileMusicUrl');
      if (savedUrl) {
        setMusicUrlInput(savedUrl);
      }
    }
  }, []);

  const handleSaveMusicUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileMusicUrl', musicUrlInput);
      alert("Profile Music URL saved!"); // Simple feedback
    }
  };

  return (
    <AppLayout currentPage="Profile Settings" showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {/* Profile Background Music Section */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Profile Background Music</h2>
          <p className="text-sm text-gray-400 mb-2">
            Paste a URL to your favorite track (e.g., YouTube, SoundCloud, Spotify embed link).
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={musicUrlInput}
              onChange={(e) => setMusicUrlInput(e.target.value)}
              placeholder="Enter music URL (e.g., YouTube, SoundCloud)"
              className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSaveMusicUrl}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold"
            >
              Save URL
            </button>
          </div>
        </div>

        {/* Other profile settings can be added here in the future */}

      </div>
    </AppLayout>
  );
};

export default ProfileSettingsPage;
