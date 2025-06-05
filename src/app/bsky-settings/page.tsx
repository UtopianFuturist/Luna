"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getPreferences, setPreferences, getProfile, updateProfileDetails } from '@/lib/bskyService';
import type { AppBskyActorDefs } from '@atproto/api';

type Preference =
  | AppBskyActorDefs.AdultContentPref
  | AppBskyActorDefs.ContentLabelPref
  | AppBskyActorDefs.SavedFeedsPref
  | AppBskyActorDefs.PersonalDetailsPref
  | AppBskyActorDefs.FeedViewPref
  | AppBskyActorDefs.ThreadViewPref
  | AppBskyActorDefs.ViewerPref
  | { $type: string; [k: string]: unknown };

const BlueSkySettingsPage: React.FC = () => {
  const { agent, isAuthenticated } = useAuth();
  const [preferences, setPreferencesState] = useState<Preference[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- Synced Preferences State ---
  const [adultContentEnabled, setAdultContentEnabled] = useState<boolean>(false);
  const [feedViewHideReplies, setFeedViewHideReplies] = useState<boolean>(false);
  const [feedViewHideReposts, setFeedViewHideReposts] = useState<boolean>(false);
  const [feedViewHideQuotePosts, setFeedViewHideQuotePosts] = useState<boolean>(false);
  const [feedViewLabMergeEnabled, setFeedViewLabMergeEnabled] = useState<boolean>(false);
  const [feedViewAutoplayAvatars, setFeedViewAutoplayAvatars] = useState<boolean | undefined>(undefined);
  const [feedViewAutoplayVideos, setFeedViewAutoplayVideos] = useState<boolean | undefined>(undefined);
  const [threadViewSort, setThreadViewSort] = useState<string>('oldest');
  const [threadViewPrioritizeFollowed, setThreadViewPrioritizeFollowed] = useState<boolean>(true);
  const [bskyDarkThemeEnabled, setBskyDarkThemeEnabled] = useState<boolean | undefined>(undefined);
  const [contentLabelPreferences, setContentLabelPreferences] = useState<AppBskyActorDefs.ContentLabelPref[] | undefined>(undefined);
  const [bskyReducedMotion, setBskyReducedMotion] = useState<boolean | undefined>(undefined); // Synced Reduced Motion

  // --- Profile-related State (Synced) ---
  const [contentLanguages, setContentLanguages] = useState<string[]>([]);
  const [initialContentLanguages, setInitialContentLanguages] = useState<string[]>([]);

  // --- Local App State (Not Synced) ---
  const LOCAL_THEME_KEY = 'ourApp_bskyDisplayTheme';
  const LOCAL_BSKY_FONT_SIZE_KEY = 'ourApp_bskyAccessibilitySettings_fontSize';
  const defaultLocalBackgroundColor = '#1A202C';
  const defaultLocalTextColor = '#E2E8F0';
  const [localCustomTheme, setLocalCustomTheme] = useState<{ backgroundColor: string, textColor: string } | null>(null);
  const [inputBackgroundColor, setInputBackgroundColor] = useState<string>(defaultLocalBackgroundColor);
  const [inputTextColor, setInputTextColor] = useState<string>(defaultLocalTextColor);
  const [localBskyFontSize, setLocalBskyFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [initialLocalBskyFontSize, setInitialLocalBskyFontSize] = useState<'small' | 'medium' | 'large'>('medium');


  const commonLanguages = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }, { code: 'ja', name: 'Japanese' }, { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' }, { code: 'ko', name: 'Korean' }, { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
  ];

  const findPreference = useCallback(<T extends Preference>(prefs: Preference[] | null, type: T['$type']): T | undefined => {
    if (!prefs) return undefined;
    return prefs.find(p => p.$type === type) as T | undefined;
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_THEME_KEY);
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        if (parsedTheme.backgroundColor && parsedTheme.textColor) {
          setLocalCustomTheme(parsedTheme);
          setInputBackgroundColor(parsedTheme.backgroundColor);
          setInputTextColor(parsedTheme.textColor);
        }
      } catch (e) { console.error("Error parsing saved local theme:", e); }
    }
    const savedFontSize = localStorage.getItem(LOCAL_BSKY_FONT_SIZE_KEY) as ('small' | 'medium' | 'large') | null;
    if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
      setLocalBskyFontSize(savedFontSize);
      setInitialLocalBskyFontSize(savedFontSize);
    }

    const fetchBskyData = async () => {
      if (!isAuthenticated || !agent) {
        setPreferencesState(null); setContentLanguages([]); setInitialContentLanguages([]);
        setAdultContentEnabled(false); setFeedViewHideReplies(false); setFeedViewHideReposts(false);
        setFeedViewHideQuotePosts(false); setFeedViewLabMergeEnabled(false); setThreadViewSort('oldest');
        setThreadViewPrioritizeFollowed(true); setBskyDarkThemeEnabled(undefined);
        setFeedViewAutoplayAvatars(undefined); setFeedViewAutoplayVideos(undefined);
        setContentLabelPreferences(undefined); setBskyReducedMotion(undefined);
        setIsLoading(false); return;
      }

      setIsLoading(true); setError(null);
      try {
        const [fetchedPreferences, userProfile] = await Promise.all([ getPreferences(agent), getProfile(agent, agent.session!.handle!) ]);
        setPreferencesState(fetchedPreferences);
        setContentLanguages(userProfile.languages || []);
        setInitialContentLanguages(userProfile.languages || []);

        const adultContentPref = findPreference<AppBskyActorDefs.AdultContentPref>(fetchedPreferences, 'app.bsky.actor.defs#adultContent');
        setAdultContentEnabled(adultContentPref?.enabled || false);

        const feedViewPref = findPreference<AppBskyActorDefs.FeedViewPref>(fetchedPreferences, 'app.bsky.actor.defs#feedView');
        setFeedViewHideReplies(feedViewPref?.hideReplies || false);
        setFeedViewHideReposts(feedViewPref?.hideReposts || false);
        setFeedViewHideQuotePosts(feedViewPref?.hideQuotePosts || false);
        setFeedViewLabMergeEnabled((feedViewPref as any)?.lab_mergeFeedEnabled || false);
        setFeedViewAutoplayAvatars((feedViewPref as any)?.autoplayAvatars === undefined ? false : (feedViewPref as any)?.autoplayAvatars);
        setFeedViewAutoplayVideos((feedViewPref as any)?.autoplayVideos === undefined ? false : (feedViewPref as any)?.autoplayVideos);

        const threadViewPref = findPreference<AppBskyActorDefs.ThreadViewPref>(fetchedPreferences, 'app.bsky.actor.defs#threadView');
        setThreadViewSort(threadViewPref?.sort || 'oldest');
        setThreadViewPrioritizeFollowed(threadViewPref?.prioritizeFollowedUsers !== undefined ? threadViewPref.prioritizeFollowedUsers : true);

        const viewerPref = findPreference<AppBskyActorDefs.ViewerPref>(fetchedPreferences, 'app.bsky.actor.defs#viewer');
        setBskyDarkThemeEnabled((viewerPref && typeof (viewerPref as any).darkThemeEnabled === 'boolean') ? (viewerPref as any).darkThemeEnabled : false);
        setBskyReducedMotion((viewerPref && typeof (viewerPref as any).reducedMotion === 'boolean') ? (viewerPref as any).reducedMotion : false); // Initialize reduced motion

        const labelPrefs = fetchedPreferences.filter(p => p.$type === 'app.bsky.actor.defs#contentLabel') as AppBskyActorDefs.ContentLabelPref[];
        setContentLabelPreferences(labelPrefs.length > 0 ? labelPrefs : undefined);
      } catch (err) {
        console.error("Error fetching BlueSky data:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching BlueSky data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBskyData();
  }, [agent, isAuthenticated, findPreference]);

  const handleContentLanguageChange = (langCode: string, isChecked: boolean) => {
    setContentLanguages(prev => isChecked ? [...prev, langCode] : prev.filter(l => l !== langCode));
  };

  const handleSaveChanges = async () => {
    if (!agent) { alert("Not authenticated."); return; }
    setIsSaving(true); setError(null);
    let preferencesChanged = false;
    let profileLanguagesChanged = false;
    let localSettingsChanged = false;
    let currentPrefsArray = preferences ? [...preferences] : [];

    // --- Synced Preferences ---
    // Adult Content
    let adultPref = findPreference<AppBskyActorDefs.AdultContentPref>(currentPrefsArray, 'app.bsky.actor.defs#adultContent');
    if (adultPref) { if (adultPref.enabled !== adultContentEnabled) { adultPref.enabled = adultContentEnabled; preferencesChanged = true; } }
    else { adultPref = { $type: 'app.bsky.actor.defs#adultContent', enabled: adultContentEnabled }; currentPrefsArray.push(adultPref); preferencesChanged = true; }

    // Feed View
    let feedViewPref = findPreference<AppBskyActorDefs.FeedViewPref>(currentPrefsArray, 'app.bsky.actor.defs#feedView');
    const newFeedViewValues: Partial<AppBskyActorDefs.FeedViewPref & { lab_mergeFeedEnabled?: boolean, autoplayAvatars?: boolean, autoplayVideos?: boolean }> = {
      hideReplies: feedViewHideReplies, hideReposts: feedViewHideReposts, hideQuotePosts: feedViewHideQuotePosts,
      lab_mergeFeedEnabled: feedViewLabMergeEnabled, autoplayAvatars: feedViewAutoplayAvatars, autoplayVideos: feedViewAutoplayVideos,
    };
    if (feedViewPref) {
      let changed = false;
      for (const key in newFeedViewValues) { if ((feedViewPref as any)[key] !== (newFeedViewValues as any)[key]) { (feedViewPref as any)[key] = (newFeedViewValues as any)[key]; changed = true; } }
      if (changed) preferencesChanged = true;
    } else {
      feedViewPref = { $type: 'app.bsky.actor.defs#feedView', ...newFeedViewValues } as AppBskyActorDefs.FeedViewPref;
      currentPrefsArray.push(feedViewPref); preferencesChanged = true;
    }

    // Thread View
    let threadViewPref = findPreference<AppBskyActorDefs.ThreadViewPref>(currentPrefsArray, 'app.bsky.actor.defs#threadView');
    const newThreadViewValues = { sort: threadViewSort, prioritizeFollowedUsers: threadViewPrioritizeFollowed };
    if (threadViewPref) { if (threadViewPref.sort !== newThreadViewValues.sort || threadViewPref.prioritizeFollowedUsers !== newThreadViewValues.prioritizeFollowedUsers) { Object.assign(threadViewPref, newThreadViewValues); preferencesChanged = true; } }
    else { threadViewPref = { $type: 'app.bsky.actor.defs#threadView', ...newThreadViewValues }; currentPrefsArray.push(threadViewPref); preferencesChanged = true; }

    // Viewer (Dark Theme & Reduced Motion)
    if (bskyDarkThemeEnabled !== undefined || bskyReducedMotion !== undefined) {
      let viewerPref = findPreference<AppBskyActorDefs.ViewerPref>(currentPrefsArray, 'app.bsky.actor.defs#viewer');
      if (!viewerPref) {
        viewerPref = { $type: 'app.bsky.actor.defs#viewer' } as AppBskyActorDefs.ViewerPref;
        currentPrefsArray.push(viewerPref);
      }
      if (bskyDarkThemeEnabled !== undefined && (viewerPref as any).darkThemeEnabled !== bskyDarkThemeEnabled) {
        (viewerPref as any).darkThemeEnabled = bskyDarkThemeEnabled; preferencesChanged = true;
      }
      if (bskyReducedMotion !== undefined && (viewerPref as any).reducedMotion !== bskyReducedMotion) {
        (viewerPref as any).reducedMotion = bskyReducedMotion; preferencesChanged = true;
      }
    }

    // --- Profile Content Languages ---
    if (JSON.stringify(contentLanguages.sort()) !== JSON.stringify(initialContentLanguages.sort())) {
      profileLanguagesChanged = true;
    }

    // --- Local Storage Settings ---
    if (localBskyFontSize !== initialLocalBskyFontSize) {
      localSettingsChanged = true;
    }

    try {
      let settingsSavedMsg = "";
      if (preferencesChanged) {
        const finalPreferencesToSave = currentPrefsArray.map(p => {
          switch (p.$type) {
            case 'app.bsky.actor.defs#adultContent': return p as AppBskyActorDefs.AdultContentPref;
            case 'app.bsky.actor.defs#feedView': return p as AppBskyActorDefs.FeedViewPref;
            case 'app.bsky.actor.defs#threadView': return p as AppBskyActorDefs.ThreadViewPref;
            case 'app.bsky.actor.defs#viewer': return p as AppBskyActorDefs.ViewerPref;
            default: return p;
          }
        }).filter(p => p.$type);
        await setPreferences(agent, finalPreferencesToSave);
        settingsSavedMsg += "Synced preferences saved. ";
      }
      if (profileLanguagesChanged) {
        await updateProfileDetails(agent, { languages: contentLanguages });
        settingsSavedMsg += "Content languages updated. ";
      }
      if (localSettingsChanged) {
        localStorage.setItem(LOCAL_BSKY_FONT_SIZE_KEY, localBskyFontSize);
        setInitialLocalBskyFontSize(localBskyFontSize); // Update initial state after save
        settingsSavedMsg += "Local font size saved. ";
      }

      if (!settingsSavedMsg) { alert("No changes to save."); } else { alert(settingsSavedMsg.trim()); }

      // Re-fetch synced data if anything was potentially changed on server
      if (preferencesChanged || profileLanguagesChanged) {
        const [refreshedPreferences, refreshedProfile] = await Promise.all([ getPreferences(agent), getProfile(agent, agent.session!.handle!) ]);
        setPreferencesState(refreshedPreferences);
        setContentLanguages(refreshedProfile.languages || []);
        setInitialContentLanguages(refreshedProfile.languages || []);

        const adultRef = findPreference<AppBskyActorDefs.AdultContentPref>(refreshedPreferences, 'app.bsky.actor.defs#adultContent');
        setAdultContentEnabled(adultRef?.enabled || false);
        const feedViewRef = findPreference<AppBskyActorDefs.FeedViewPref>(refreshedPreferences, 'app.bsky.actor.defs#feedView');
        setFeedViewHideReplies(feedViewRef?.hideReplies || false); setFeedViewHideReposts(feedViewRef?.hideReposts || false);
        setFeedViewHideQuotePosts(feedViewRef?.hideQuotePosts || false); setFeedViewLabMergeEnabled((feedViewRef as any)?.lab_mergeFeedEnabled || false);
        setFeedViewAutoplayAvatars((feedViewRef as any)?.autoplayAvatars === undefined ? false : (feedViewRef as any)?.autoplayAvatars);
        setFeedViewAutoplayVideos((feedViewRef as any)?.autoplayVideos === undefined ? false : (feedViewRef as any)?.autoplayVideos);
        const threadViewRef = findPreference<AppBskyActorDefs.ThreadViewPref>(refreshedPreferences, 'app.bsky.actor.defs#threadView');
        setThreadViewSort(threadViewRef?.sort || 'oldest');
        setThreadViewPrioritizeFollowed(threadViewRef?.prioritizeFollowedUsers !== undefined ? threadViewRef.prioritizeFollowedUsers : true);
        const viewerRef = findPreference<AppBskyActorDefs.ViewerPref>(refreshedPreferences, 'app.bsky.actor.defs#viewer');
        setBskyDarkThemeEnabled( (viewerRef && typeof (viewerRef as any).darkThemeEnabled === 'boolean') ? (viewerRef as any).darkThemeEnabled : false );
        setBskyReducedMotion((viewerRef && typeof (viewerRef as any).reducedMotion === 'boolean') ? (viewerRef as any).reducedMotion : false);
        const labelPrefsRefreshed = refreshedPreferences.filter(p => p.$type === 'app.bsky.actor.defs#contentLabel') as AppBskyActorDefs.ContentLabelPref[];
        setContentLabelPreferences(labelPrefsRefreshed.length > 0 ? labelPrefsRefreshed : undefined);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error during save.";
      setError(errorMsg); alert(`Error saving settings: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-white">Loading settings...</div></AppLayout>;
  if (error && !preferences && !isAuthenticated && !agent?.session) return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-red-400">Error: {error} <p>Please ensure you are logged in.</p></div></AppLayout>;
  if (!isAuthenticated || !agent) return <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}><div className="p-4 text-white">Please log in to manage BlueSky settings.</div></AppLayout>;

  return (
    <AppLayout currentPage="BlueSky Settings" showHeader={true} showSidebarButton={true}>
      <div className="p-4 md:p-6 text-white space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold mb-1">BlueSky Settings</h1>
          <p className="text-sm text-gray-400">Manage your BlueSky content, feed, and app preferences.</p>
        </div>

        {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}

        {/* Account Settings Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Account Information</h2>
          {isAuthenticated && agent?.session ? (
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-gray-300">Handle: </span><span className="text-gray-100 break-all">@{agent.session.handle}</span></div>
              <div><span className="font-semibold text-gray-300">DID: </span><span className="text-gray-100 break-all">{agent.session.did}</span></div>
              <div><span className="font-semibold text-gray-300">Email: </span><span className="text-gray-100 break-all">{agent.session.email || '(Not available)'}</span></div>
              <div><span className="font-semibold text-gray-300">PDS Endpoint: </span><span className="text-gray-100 break-all">{agent.service.toString()}</span></div>
              <div className="pt-2"><p className="text-xs text-gray-400">For critical account settings such as changing your handle, updating your email, managing your password, or deleting your account, please use the <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">official BlueSky application or website</a>.</p></div>
            </div>
          ) : (<p className="text-gray-400">Log in to view account details.</p>)}
        </div>

        {/* Accessibility Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Accessibility</h2>
          {/* Synced Reduced Motion Subsection */}
          {bskyReducedMotion !== undefined ? (
            <div className="flex items-center justify-between mb-4">
              <div>
                <label htmlFor="bskyReducedMotionToggle" className="font-medium text-gray-200">Enable BlueSky Reduced Motion</label>
                <p className="text-xs text-gray-400">Syncs with BlueSky's setting to reduce animations.</p>
              </div>
              <button id="bskyReducedMotionToggle" onClick={() => setBskyReducedMotion(!bskyReducedMotion)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${bskyReducedMotion ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={bskyReducedMotion}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${bskyReducedMotion ? 'translate-x-6' : 'translate-x-1'}`}/></button>
            </div>
          ) : (<p className="text-sm text-gray-400 mb-4">Loading synced accessibility settings...</p>)}

          {/* Local Font Size Subsection */}
          <div>
            <label htmlFor="localFontSizeSelect" className="font-medium text-gray-200 block mb-1">Font Size for BlueSky Content (Local)</label>
            <p className="text-xs text-gray-400 mb-2">This setting is saved in your browser and affects this app only.</p>
            <select
              id="localFontSizeSelect"
              value={localBskyFontSize}
              onChange={(e) => setLocalBskyFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="bg-gray-700 text-white p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full sm:w-auto"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Content Filtering Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Content Filtering</h2>
          <div className="flex items-center justify-between">
            <div><label htmlFor="adultContentToggle" className="font-medium text-gray-200">Enable Adult Content</label><p className="text-xs text-gray-400">Show content that may be considered adult.</p></div>
            <button id="adultContentToggle" onClick={() => setAdultContentEnabled(!adultContentEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${adultContentEnabled ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={adultContentEnabled}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${adultContentEnabled ? 'translate-x-6' : 'translate-x-1'}`}/></button>
          </div>
        </div>

        {/* Content & Media Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Content & Media</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Media Autoplay</h3>
            <div className="space-y-3">
              {(feedViewAutoplayAvatars !== undefined) ? (<div className="flex items-center justify-between"><div><label htmlFor="autoplayAvatarsToggle" className="font-medium text-gray-200">Autoplay Animated Avatars</label><p className="text-xs text-gray-400">Play animated avatars automatically.</p></div><button id="autoplayAvatarsToggle" onClick={() => setFeedViewAutoplayAvatars(!feedViewAutoplayAvatars)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewAutoplayAvatars ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewAutoplayAvatars}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewAutoplayAvatars ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>) : (<p className="text-sm text-gray-400">Autoplay Avatars setting not available.</p>)}
              {(feedViewAutoplayVideos !== undefined) ? (<div className="flex items-center justify-between"><div><label htmlFor="autoplayVideosToggle" className="font-medium text-gray-200">Autoplay Videos</label><p className="text-xs text-gray-400">Play videos automatically when in view.</p></div><button id="autoplayVideosToggle" onClick={() => setFeedViewAutoplayVideos(!feedViewAutoplayVideos)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewAutoplayVideos ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewAutoplayVideos}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewAutoplayVideos ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>) : (<p className="text-sm text-gray-400">Autoplay Videos setting not available.</p>)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2 mt-4">Content Label Preferences</h3>
            {contentLabelPreferences === undefined && !isLoading && <p className="text-sm text-gray-400">Loading label preferences...</p>}
            {contentLabelPreferences && contentLabelPreferences.length > 0 ? (
              <div className="space-y-2 text-xs bg-gray-700/30 p-3 rounded-md">
                {contentLabelPreferences.map((labelPref, index) => ( <div key={index} className="p-1.5 bg-gray-600/50 rounded"><p className="text-gray-200"><span className="font-semibold">Label:</span> {labelPref.label} {labelPref.labelerDid && <span className="text-gray-400 text-[10px] ml-1">(by {labelPref.labelerDid.substring(0,18)}...)</span>}</p><p className="text-gray-300"><span className="font-semibold">Visibility:</span> {labelPref.visibility}</p></div> ))}
              </div>
            ) : (!isLoading && <p className="text-sm text-gray-400">No specific content label preferences are currently set via API.</p>)}
            <p className="text-xs text-gray-500 mt-2">Note: Modifying these specific label preferences is not yet supported in this app.</p>
          </div>
        </div>

        {/* Feed Preferences Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Feed Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div><label htmlFor="feedViewHideRepliesToggle" className="font-medium text-gray-200">Hide Replies in Feeds</label><p className="text-xs text-gray-400">Reduce clutter by hiding replies in your feeds.</p></div><button id="feedViewHideRepliesToggle" onClick={() => setFeedViewHideReplies(!feedViewHideReplies)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewHideReplies ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewHideReplies}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewHideReplies ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>
            <div className="flex items-center justify-between"><div><label htmlFor="feedViewHideRepostsToggle" className="font-medium text-gray-200">Hide Reposts in Feeds</label><p className="text-xs text-gray-400">Content warning: this is a commonly requested feature.</p></div><button id="feedViewHideRepostsToggle" onClick={() => setFeedViewHideReposts(!feedViewHideReposts)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewHideReposts ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewHideReposts}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewHideReposts ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>
            <div className="flex items-center justify-between"><div><label htmlFor="feedViewHideQuotePostsToggle" className="font-medium text-gray-200">Hide Quote Posts in Feeds</label><p className="text-xs text-gray-400">Content warning: this is a commonly requested feature.</p></div><button id="feedViewHideQuotePostsToggle" onClick={() => setFeedViewHideQuotePosts(!feedViewHideQuotePosts)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewHideQuotePosts ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewHideQuotePosts}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewHideQuotePosts ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>
            <div className="flex items-center justify-between"><div><label htmlFor="feedViewLabMergeEnabledToggle" className="font-medium text-gray-200">Enable Merged Feed (Lab)</label><p className="text-xs text-gray-400">Experimental: Merge different feed sources. May not be standard.</p></div><button id="feedViewLabMergeEnabledToggle" onClick={() => setFeedViewLabMergeEnabled(!feedViewLabMergeEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${feedViewLabMergeEnabled ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={feedViewLabMergeEnabled}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${feedViewLabMergeEnabled ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>
          </div>
        </div>

        {/* Thread View Preferences Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Thread View Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><label htmlFor="threadViewSortSelect" className="font-medium text-gray-200">Sort Replies</label><p className="text-xs text-gray-400">Choose how replies in a thread are sorted.</p></div><select id="threadViewSortSelect" value={threadViewSort} onChange={(e) => setThreadViewSort(e.target.value)} className="bg-gray-700 text-white p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"><option value="oldest">Oldest First</option><option value="newest">Newest First</option><option value="most-likes">Most Likes</option></select></div>
            <div className="flex items-center justify-between"><div><label htmlFor="threadViewPrioritizeFollowedToggle" className="font-medium text-gray-200">Prioritize Followed Users</label><p className="text-xs text-gray-400">Show replies from users you follow first.</p></div><button id="threadViewPrioritizeFollowedToggle" onClick={() => setThreadViewPrioritizeFollowed(!threadViewPrioritizeFollowed)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${threadViewPrioritizeFollowed ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={threadViewPrioritizeFollowed}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${threadViewPrioritizeFollowed ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>
          </div>
        </div>

        {/* App Appearance Section (BlueSky Synced) */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">App Appearance (Synced with BlueSky)</h2>
          {bskyDarkThemeEnabled === undefined ? (<p className="text-sm text-gray-400">Loading theme setting...</p>) : (<div className="flex items-center justify-between"><div><label htmlFor="bskyDarkThemeToggle" className="font-medium text-gray-200">Enable BlueSky Dark Mode</label><p className="text-xs text-gray-400">This setting attempts to sync with a BlueSky preference for dark mode.</p></div><button id="bskyDarkThemeToggle" onClick={() => setBskyDarkThemeEnabled(!bskyDarkThemeEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${bskyDarkThemeEnabled ? 'bg-blue-600' : 'bg-gray-600'}`} aria-checked={bskyDarkThemeEnabled}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${bskyDarkThemeEnabled ? 'translate-x-6' : 'translate-x-1'}`}/></button></div>)}
        </div>

        {/* Local Custom Theme Settings Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Custom App Theme (Local)</h2>
          <p className="text-xs text-gray-400 mb-3">Customize the look of content areas. This is saved locally in your browser and does not sync with BlueSky.</p>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"><label htmlFor="inputBackgroundColor" className="font-medium text-gray-200 mb-1 sm:mb-0">Background Color:</label><input type="color" id="inputBackgroundColor" value={inputBackgroundColor} onChange={(e) => setInputBackgroundColor(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-1 h-10 w-full sm:w-24 cursor-pointer"/></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"><label htmlFor="inputTextColor" className="font-medium text-gray-200 mb-1 sm:mb-0">Text Color:</label><input type="color" id="inputTextColor" value={inputTextColor} onChange={(e) => setInputTextColor(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-1 h-10 w-full sm:w-24 cursor-pointer"/></div>
            {localCustomTheme && (<div className="p-3 bg-gray-700/50 rounded-md text-xs my-2"><p className="font-semibold mb-1 text-gray-300">Current Saved Custom Theme:</p><div className="flex items-center space-x-2"><span className="w-4 h-4 rounded border border-gray-500 inline-block" style={{ backgroundColor: localCustomTheme.backgroundColor }} title={`Background: ${localCustomTheme.backgroundColor}`}></span><span className="text-gray-400">Background: {localCustomTheme.backgroundColor}</span></div><div className="flex items-center space-x-2 mt-1"><span className="w-4 h-4 rounded border border-gray-500 inline-block" style={{ backgroundColor: localCustomTheme.textColor }} title={`Text: ${localCustomTheme.textColor}`}></span><span className="text-gray-400">Text: {localCustomTheme.textColor}</span></div></div>)}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2"><button onClick={() => { const newTheme = { backgroundColor: inputBackgroundColor, textColor: inputTextColor }; localStorage.setItem(LOCAL_THEME_KEY, JSON.stringify(newTheme)); setLocalCustomTheme(newTheme); alert("Custom theme saved locally!"); }} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md text-sm w-full sm:w-auto">Save Custom Theme</button><button onClick={() => { localStorage.removeItem(LOCAL_THEME_KEY); setLocalCustomTheme(null); setInputBackgroundColor(defaultLocalBackgroundColor); setInputTextColor(defaultLocalTextColor); alert("Custom theme cleared!"); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md text-sm w-full sm:w-auto">Clear Custom Theme</button></div>
          </div>
        </div>

        {/* Content Languages Section */}
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Content Languages</h2>
          <p className="text-xs text-gray-400 mb-3">Select the languages you want to see content in. This affects posts and other content displayed in the app.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {commonLanguages.map(lang => ( <label key={lang.code} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" checked={contentLanguages.includes(lang.code)} onChange={(e) => handleContentLanguageChange(lang.code, e.target.checked)}/><span className="text-sm text-gray-200">{lang.name}</span></label> ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
          <button onClick={handleSaveChanges} disabled={isSaving || isLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : 'Save BlueSky Settings'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BlueSkySettingsPage;
