"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getPreferences, setPreferences, getProfile, updateProfileDetails } from '@/lib/bskyService'; // Added getProfile, updateProfileDetails
import type { AppBskyActorDefs } from '@atproto/api';

// Explicitly type Preference union based on known preference types
type Preference =
  | AppBskyActorDefs.AdultContentPref
  | AppBskyActorDefs.ContentLabelPref // Assuming this is the correct type for content labels if used directly
  | AppBskyActorDefs.SavedFeedsPref
  | AppBskyActorDefs.PersonalDetailsPref
  | AppBskyActorDefs.FeedViewPref
  | AppBskyActorDefs.ThreadViewPref
  // Add other specific preference types here as they are identified and used
  | { $type: string; [k: string]: unknown }; // Fallback for unknown preference types

const BlueSkySettingsPage: React.FC = () => {
  const { agent, isAuthenticated } = useAuth();
  const [preferences, setPreferencesState] = useState<Preference[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Pending changes for various settings
  // Storing them separately makes UI binding easier
  const [adultContentEnabled, setAdultContentEnabled] = useState<boolean>(false);

  // Feed View Preferences
  const [feedViewHideReplies, setFeedViewHideReplies] = useState<boolean>(false);
  const [feedViewHideReposts, setFeedViewHideReposts] = useState<boolean>(false);
  const [feedViewHideQuotePosts, setFeedViewHideQuotePosts] = useState<boolean>(false);
  const [feedViewLabMergeEnabled, setFeedViewLabMergeEnabled] = useState<boolean>(false); // Assuming 'lab_mergeFeedEnabled' or similar

  // Thread View Preferences
  const [threadViewSort, setThreadViewSort] = useState<string>('oldest'); // Default sort
  const [threadViewPrioritizeFollowed, setThreadViewPrioritizeFollowed] = useState<boolean>(true);

  // Content Languages
  const [contentLanguages, setContentLanguages] = useState<string[]>([]);
  const [initialContentLanguages, setInitialContentLanguages] = useState<string[]>([]);

  // Define a list of common languages for the UI
  const commonLanguages = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' }, { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' }, { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' }, { code: 'zh', name: 'Chinese' },
    // Add more as needed
  ];

  const findPreference = useCallback(<T extends Preference>(
    prefs: Preference[] | null,
    type: T['$type']
  ): T | undefined => {
    if (!prefs) return undefined;
    return prefs.find(p => p.$type === type) as T | undefined;
  }, []);

  // Fetch preferences on load
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !agent) {
        setIsLoading(false);
        setError("Not authenticated. Please log in.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both preferences and profile
        const [fetchedPreferences, userProfile] = await Promise.all([
          getPreferences(agent),
          getProfile(agent, agent.session!.handle!) // Assuming session and handle are present if authenticated
        ]);

        setPreferencesState(fetchedPreferences);

        // Initialize Content Languages from profile
        setContentLanguages(userProfile.languages || []);
        setInitialContentLanguages(userProfile.languages || []);

        // Initialize UI state from fetched preferences
        const adultContentPref = findPreference<AppBskyActorDefs.AdultContentPref>(fetchedPreferences, 'app.bsky.actor.defs#adultContent');
        setAdultContentEnabled(adultContentPref?.enabled || false);

        // Example for FeedViewPref - assumes a single global one for now, or the first one found.
        // A real app might need to allow users to configure this for *specific* feeds if the preference allows it (e.g. feedViewPref.feed field)
        const feedViewPref = findPreference<AppBskyActorDefs.FeedViewPref>(fetchedPreferences, 'app.bsky.actor.defs#feedView');
        setFeedViewHideReplies(feedViewPref?.hideReplies || false);
        setFeedViewHideReposts(feedViewPref?.hideReposts || false);
        setFeedViewHideQuotePosts(feedViewPref?.hideQuotePosts || false);
        // The field for merged feeds might be named differently, e.g. "lab_mergeFeedEnabled" or specific to a lab.
        // Using a common pattern for lab features. This might not be a standard field.
        setFeedViewLabMergeEnabled((feedViewPref as any)?.lab_mergeFeedEnabled || false);


        const threadViewPref = findPreference<AppBskyActorDefs.ThreadViewPref>(fetchedPreferences, 'app.bsky.actor.defs#threadView');
        setThreadViewSort(threadViewPref?.sort || 'oldest');
        setThreadViewPrioritizeFollowed(threadViewPref?.prioritizeFollowedUsers !== undefined ? threadViewPref.prioritizeFollowedUsers : true);

      } catch (err) {
        console.error("Error fetching preferences:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching initial data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [agent, isAuthenticated, findPreference]);

  const handleContentLanguageChange = (langCode: string, isChecked: boolean) => {
    setContentLanguages(prev =>
      isChecked ? [...prev, langCode] : prev.filter(l => l !== langCode)
    );
  };

  const handleSaveChanges = async () => {
    if (!agent) { // Preferences might be null if never set, but agent must exist
      alert("Not authenticated.");
      return;
    }
    setIsSaving(true);
    setError(null);
    let preferencesChanged = false;
    let profileLanguagesChanged = false;

    // --- Preference Updates ---
    // Create a mutable copy of current preferences or an empty array if null
    let currentPrefsArray = preferences ? [...preferences] : [];

    // --- Adult Content Preference ---
    let adultPref = findPreference<AppBskyActorDefs.AdultContentPref>(updatedPreferences, 'app.bsky.actor.defs#adultContent');
    let adultPref = findPreference<AppBskyActorDefs.AdultContentPref>(currentPrefsArray, 'app.bsky.actor.defs#adultContent');
    if (adultPref) {
      if (adultPref.enabled !== adultContentEnabled) {
        adultPref.enabled = adultContentEnabled;
        preferencesChanged = true;
      }
    } else {
      adultPref = { $type: 'app.bsky.actor.defs#adultContent', enabled: adultContentEnabled };
      currentPrefsArray.push(adultPref);
      preferencesChanged = true;
    }

    // --- Feed View Preference ---
    let feedViewPref = findPreference<AppBskyActorDefs.FeedViewPref>(currentPrefsArray, 'app.bsky.actor.defs#feedView');
    const newFeedViewValues = {
      hideReplies: feedViewHideReplies,
      hideReposts: feedViewHideReposts,
      hideQuotePosts: feedViewHideQuotePosts,
      lab_mergeFeedEnabled: feedViewLabMergeEnabled,
    };
    if (feedViewPref) {
      if (
        feedViewPref.hideReplies !== newFeedViewValues.hideReplies ||
        feedViewPref.hideReposts !== newFeedViewValues.hideReposts ||
        feedViewPref.hideQuotePosts !== newFeedViewValues.hideQuotePosts ||
        (feedViewPref as any).lab_mergeFeedEnabled !== newFeedViewValues.lab_mergeFeedEnabled
      ) {
        Object.assign(feedViewPref, newFeedViewValues);
        preferencesChanged = true;
      }
    } else {
      feedViewPref = { $type: 'app.bsky.actor.defs#feedView', ...newFeedViewValues } as AppBskyActorDefs.FeedViewPref;
      currentPrefsArray.push(feedViewPref);
      preferencesChanged = true;
    }

    // --- Thread View Preference ---
    let threadViewPref = findPreference<AppBskyActorDefs.ThreadViewPref>(currentPrefsArray, 'app.bsky.actor.defs#threadView');
    const newThreadViewValues = {
      sort: threadViewSort,
      prioritizeFollowedUsers: threadViewPrioritizeFollowed,
    };
    if (threadViewPref) {
      if (
        threadViewPref.sort !== newThreadViewValues.sort ||
        threadViewPref.prioritizeFollowedUsers !== newThreadViewValues.prioritizeFollowedUsers
      ) {
        Object.assign(threadViewPref, newThreadViewValues);
        preferencesChanged = true;
      }
    } else {
      threadViewPref = { $type: 'app.bsky.actor.defs#threadView', ...newThreadViewValues };
      currentPrefsArray.push(threadViewPref);
      preferencesChanged = true;
    }

    // --- Content Languages (Profile Update) ---
    if (JSON.stringify(contentLanguages.sort()) !== JSON.stringify(initialContentLanguages.sort())) {
      profileLanguagesChanged = true;
    }

    try {
      let settingsSavedMsg = "";
      if (preferencesChanged) {
        // Filter and map to ensure correct types are sent for known preferences
        const finalPreferencesToSave = currentPrefsArray.map(p => {
          switch (p.$type) {
            case 'app.bsky.actor.defs#adultContent': return p as AppBskyActorDefs.AdultContentPref;
            case 'app.bsky.actor.defs#feedView': return p as AppBskyActorDefs.FeedViewPref;
            case 'app.bsky.actor.defs#threadView': return p as AppBskyActorDefs.ThreadViewPref;
            // Add other known preference types here
            default: return p;
          }
        }).filter(p => p.$type); // Basic validation: ensure $type exists

        await setPreferences(agent, finalPreferencesToSave);
        settingsSavedMsg += "Preferences saved. ";
      }

      if (profileLanguagesChanged) {
        await updateProfileDetails(agent, { languages: contentLanguages });
        settingsSavedMsg += "Content languages updated.";
      }

      if (!settingsSavedMsg) {
        alert("No changes to save.");
      } else {
        alert(settingsSavedMsg.trim());
      }

      // Re-fetch all data to ensure UI consistency
      const [refreshedPreferences, refreshedProfile] = await Promise.all([
        getPreferences(agent),
        getProfile(agent, agent.session!.handle!)
      ]);
      setPreferencesState(refreshedPreferences);
      setContentLanguages(refreshedProfile.languages || []);
      setInitialContentLanguages(refreshedProfile.languages || []);

      // Re-initialize UI states
      const adultContentPrefRefreshed = findPreference<AppBskyActorDefs.AdultContentPref>(refreshedPreferences, 'app.bsky.actor.defs#adultContent');
      setAdultContentEnabled(adultContentPrefRefreshed?.enabled || false);

      const feedViewPrefRefreshed = findPreference<AppBskyActorDefs.FeedViewPref>(refreshedPreferences, 'app.bsky.actor.defs#feedView');
      setFeedViewHideReplies(feedViewPrefRefreshed?.hideReplies || false);
      setFeedViewHideReposts(feedViewPrefRefreshed?.hideReposts || false);
      setFeedViewHideQuotePosts(feedViewPrefRefreshed?.hideQuotePosts || false);
      setFeedViewLabMergeEnabled((feedViewPrefRefreshed as any)?.lab_mergeFeedEnabled || false);

      const threadViewPrefRefreshed = findPreference<AppBskyActorDefs.ThreadViewPref>(refreshedPreferences, 'app.bsky.actor.defs#threadView');
      setThreadViewSort(threadViewPrefRefreshed?.sort || 'oldest');
      setThreadViewPrioritizeFollowed(threadViewPrefRefreshed?.prioritizeFollowedUsers !== undefined ? threadViewPrefRefreshed.prioritizeFollowedUsers : true);

    } catch (err) {
      console.error("Error saving settings:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error during save.";
      setError(errorMsg);
      alert(`Error saving settings: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-white">Loading settings...</div></AppLayout>;
  }

  if (error && !preferences) { // Show critical error if preferences couldn't be loaded at all
    return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-red-400">Error: {error}</div></AppLayout>;
  }

  if (!isAuthenticated || !agent) {
     return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-white">Please log in to manage BlueSky settings.</div></AppLayout>;
  }


  return (
    <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}>
      <div className="p-4 md:p-6 text-white space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold mb-1">BlueSky Settings</h1>
          <p className="text-sm text-gray-400">Manage your BlueSky content and feed preferences.</p>
        </div>

        {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}

        {/* Content Filtering Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Content Filtering</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="adultContentToggle" className="font-medium text-gray-200">Enable Adult Content</label>
                <p className="text-xs text-gray-400">Show content that may be considered adult.</p>
              </div>
              <button
                id="adultContentToggle"
                onClick={() => setAdultContentEnabled(!adultContentEnabled)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  adultContentEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={adultContentEnabled}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    adultContentEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Feed Preferences Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Feed Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="feedViewHideRepliesToggle" className="font-medium text-gray-200">Hide Replies in Feeds</label>
                <p className="text-xs text-gray-400">Reduce clutter by hiding replies in your feeds.</p>
              </div>
              <button
                id="feedViewHideRepliesToggle"
                onClick={() => setFeedViewHideReplies(!feedViewHideReplies)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  feedViewHideReplies ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={feedViewHideReplies}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    feedViewHideReplies ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {/* Add more feed view toggles here, e.g., for hideReposts, hideQuotePosts */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="feedViewHideRepostsToggle" className="font-medium text-gray-200">Hide Reposts in Feeds</label>
                <p className="text-xs text-gray-400">Content warning: this is a commonly requested feature.</p>
              </div>
              <button
                id="feedViewHideRepostsToggle"
                onClick={() => setFeedViewHideReposts(!feedViewHideReposts)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  feedViewHideReposts ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={feedViewHideReposts}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    feedViewHideReposts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="feedViewHideQuotePostsToggle" className="font-medium text-gray-200">Hide Quote Posts in Feeds</label>
                <p className="text-xs text-gray-400">Content warning: this is a commonly requested feature.</p>
              </div>
              <button
                id="feedViewHideQuotePostsToggle"
                onClick={() => setFeedViewHideQuotePosts(!feedViewHideQuotePosts)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  feedViewHideQuotePosts ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={feedViewHideQuotePosts}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    feedViewHideQuotePosts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="feedViewLabMergeEnabledToggle" className="font-medium text-gray-200">Enable Merged Feed (Lab)</label>
                <p className="text-xs text-gray-400">Experimental: Merge different feed sources. May not be standard.</p>
              </div>
              <button
                id="feedViewLabMergeEnabledToggle"
                onClick={() => setFeedViewLabMergeEnabled(!feedViewLabMergeEnabled)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  feedViewLabMergeEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={feedViewLabMergeEnabled}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    feedViewLabMergeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Thread View Preferences Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Thread View Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="threadViewSortSelect" className="font-medium text-gray-200">Sort Replies</label>
                <p className="text-xs text-gray-400">Choose how replies in a thread are sorted.</p>
              </div>
              <select
                id="threadViewSortSelect"
                value={threadViewSort}
                onChange={(e) => setThreadViewSort(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
                <option value="most-likes">Most Likes</option>
                {/* <option value="random">Random</option>  Potentially another option */}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="threadViewPrioritizeFollowedToggle" className="font-medium text-gray-200">Prioritize Followed Users</label>
                <p className="text-xs text-gray-400">Show replies from users you follow first.</p>
              </div>
              <button
                id="threadViewPrioritizeFollowedToggle"
                onClick={() => setThreadViewPrioritizeFollowed(!threadViewPrioritizeFollowed)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  threadViewPrioritizeFollowed ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-checked={threadViewPrioritizeFollowed}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    threadViewPrioritizeFollowed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content Languages Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Content Languages</h2>
          <p className="text-xs text-gray-400 mb-3">Select the languages you want to see content in. This affects posts and other content displayed in the app.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {commonLanguages.map(lang => (
              <label key={lang.code} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  checked={contentLanguages.includes(lang.code)}
                  onChange={(e) => handleContentLanguageChange(lang.code, e.target.checked)}
                />
                <span className="text-sm text-gray-200">{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save BlueSky Settings'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BlueSkySettingsPage;
