"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout'; // Assuming AppLayout is in src/components
import { useAuth } from '@/contexts/AuthContext'; // Adjusted path
import { getProfile, getPreferences } from '@/lib/bskyService'; // Added getPreferences
import type { AppBskyActorDefs } from '@atproto/api'; // Import the specific type

const ProfileSettingsPage: React.FC = () => {
  const [musicUrlInput, setMusicUrlInput] = useState<string>("");
  const { agent, isAuthenticated, session } = useAuth(); // Get agent and session handle

  const [bskyProfile, setBskyProfile] = useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);


  // Load saved music URL from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('profileMusicUrl');
      if (savedUrl) {
        setMusicUrlInput(savedUrl);
      }
    }
  }, []);

  // Fetch BlueSky profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isAuthenticated && agent && session?.handle) {
        setIsLoadingProfile(true);
        setFetchError(null);
        try {
          console.log(`Fetching BlueSky profile for: ${session.handle}`);
          const profileData = await getProfile(agent, session.handle);
          setBskyProfile(profileData);
          console.log("Fetched BlueSky Profile:", profileData);
        } catch (err) {
          console.error("Failed to fetch BlueSky profile:", err);
          setFetchError(err instanceof Error ? err.message : "Unknown error fetching BlueSky profile.");
          setBskyProfile(null);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setBskyProfile(null); // Clear profile if not authenticated or no agent/handle
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [agent, isAuthenticated, session]);

  // Temp: useEffect to fetch and log all preferences
  useEffect(() => {
    const fetchAndLogPreferences = async () => {
      if (isAuthenticated && agent) {
        try {
          console.log("Attempting to fetch all BlueSky preferences...");
          const preferences = await getPreferences(agent); // Using the existing service function
          console.log("Raw BlueSky Preferences Response:", JSON.stringify(preferences, null, 2));
          // You can also iterate and log individual preference types if helpful
          preferences.forEach(pref => {
            console.log(`Preference type: ${pref.$type}, value:`, pref);
          });
        } catch (error) {
          console.error("Error fetching BlueSky preferences for logging:", error);
        }
      }
    };
    // Run this once when agent is available and user is authenticated
    // Add a small delay or a button if you want to avoid running on every mount/auth change during dev
    if (agent && isAuthenticated) {
       // setTimeout(fetchAndLogPreferences, 2000); // Example delay
       fetchAndLogPreferences(); // Or call directly
    }
  }, [agent, isAuthenticated]);


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

        {/* BlueSky Account Details Section */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">BlueSky Account Details</h2>
          {!isAuthenticated ? (
            <p className="text-gray-400">Please log in to BlueSky to see profile details.</p>
          ) : isLoadingProfile ? (
            <p className="text-gray-400">Loading BlueSky profile...</p>
          ) : fetchError ? (
            <div className="text-red-400">
              <p>Error fetching BlueSky profile:</p>
              <p className="text-sm">{fetchError}</p>
            </div>
          ) : bskyProfile ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-300">Display Name: </span>
                <span className="text-gray-100">{bskyProfile.displayName || '(Not set)'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-300">Handle: </span>
                <span className="text-gray-100">@{bskyProfile.handle}</span>
              </div>
              {bskyProfile.description && (
                 <div>
                  <span className="font-semibold text-gray-300">Bio: </span>
                  <p className="text-gray-200 whitespace-pre-wrap break-words">{bskyProfile.description}</p>
                </div>
              )}
               {bskyProfile.avatar && (
                <div className="mt-2">
                  <span className="font-semibold text-gray-300 block mb-1">Avatar:</span>
                  <img src={bskyProfile.avatar} alt="Avatar" className="w-20 h-20 rounded-full border border-gray-600"/>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Could not load BlueSky profile. Ensure you are logged in and the handle is available.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettingsPage;
