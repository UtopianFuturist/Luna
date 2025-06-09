"use client";

import React, { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Already present, ensure it's used for feeds
import { Menu, Bell, Home, Search, MessageCircle, User, Settings, Globe, Hash } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BrowserAudioContext } from '@/contexts/BrowserAudioContext';
import UserMenu from '@/components/UserMenu';
import { getPreferences, getFeedGenerators } from '@/lib/bskyService'; // Service imports
import type { AppBskyActorDefs, AppBskyFeedDefs } from '@atproto/api'; // Type imports

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  showHeader?: boolean;
  showSidebarButton?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage = 'home',
  showHeader = true,
  showSidebarButton = false,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { agent, isAuthenticated, session } = useAuth(); // Added agent
  const browserAudioCtx = useContext(BrowserAudioContext);

  // State for pinned feeds
  const [pinnedFeeds, setPinnedFeeds] = useState<AppBskyFeedDefs.GeneratorView[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState<boolean>(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  // State for top nav visibility
  const [isFeedsNavVisible, setIsFeedsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchUserFeeds = async () => {
      if (!isAuthenticated || !agent) {
        setPinnedFeeds([]);
        setIsLoadingFeeds(false);
        return;
      }

      setIsLoadingFeeds(true);
      setFeedError(null);
      try {
        // Step A: Fetch Preferences
        const prefs = await getPreferences(agent);
        const savedFeedsPref = prefs.find(
          (p): p is AppBskyActorDefs.SavedFeedsPref => p.$type === 'app.bsky.actor.defs#savedFeeds'
        );

        if (savedFeedsPref && savedFeedsPref.pinned && savedFeedsPref.pinned.length > 0) {
          // Step B: Fetch Feed Generator Details
          const feedUris = savedFeedsPref.pinned;
          console.log("Pinned feed URIs:", feedUris);
          const { feeds: feedGeneratorViews } = await getFeedGenerators(agent, feedUris);
          setPinnedFeeds(feedGeneratorViews);
          console.log("Fetched Pinned Feeds:", feedGeneratorViews);
        } else {
          setPinnedFeeds([]); // No pinned feeds or preference not found
        }
      } catch (err) {
        console.error("Error fetching feeds:", err);
        setFeedError(err instanceof Error ? err.message : "Unknown error fetching feeds.");
        setPinnedFeeds([]);
      } finally {
        setIsLoadingFeeds(false);
      }
    };

    fetchUserFeeds();
  }, [agent, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) { // Added a threshold of 50px to avoid hiding on small scrolls
        // Scrolling down
        setIsFeedsNavVisible(false);
      } else {
        // Scrolling up
        setIsFeedsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);


  if (!browserAudioCtx) {
    // This should not happen if provider is correctly placed at the root
    return <div>Error: BrowserAudioContext not found.</div>;
  }
  const { audioUrl, isPlaying } = browserAudioCtx;
  
  // Hide bottom tab bar on welcome, signin, and account creation pages
  const hideTabBar = ['/welcome', '/signin', '/create-account', '/callback'].includes(pathname);

  // Only show the layout if authenticated or on non-protected routes
  if (!isAuthenticated && !hideTabBar) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {showHeader && (
        <>
          <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
            <div className="flex items-center justify-between p-3 h-14"> {/* Added h-14 for explicit height */}
              <div className="flex items-center">
                {/* Sidebar button is moved to the new nav bar below */}
                <h1 className="text-xl font-bold ml-2">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
              </div>
              <div className="relative">
                <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-full hover:bg-gray-800"
              >
                <Image
                  src="/OmniSky_Logo.jpeg"
                  alt="OmniSky Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </button>
              <UserMenu isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
              </div>
            </div>
          </header>
          {/* New Top Navigation Bar for Feeds */}
          {/* This bar is sticky below the main header. Adjust top-14 if main header height changes. */}
          <nav className={`sticky top-14 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 px-3 py-2 flex items-center justify-between h-12 transition-transform duration-300 ease-in-out ${isFeedsNavVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            {/* Left: Sidebar Toggle */}
            {showSidebarButton && (
              <button className="p-2 rounded-full hover:bg-gray-700">
                <Menu size={20} />
              </button>
            )}
            {!showSidebarButton && <div className="w-10"></div>} {/* Placeholder to maintain layout if no button */}

            {/* Center: Feeds Area */}
            <div className="flex-grow text-center text-sm text-gray-300 px-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {isLoadingFeeds ? (
                <span>Loading feeds...</span>
              ) : feedError ? (
                <span className="text-red-400">Error: {feedError.substring(0,50)}...</span>
              ) : pinnedFeeds.length > 0 ? (
                pinnedFeeds.map((feed, index) => (
                  <React.Fragment key={feed.uri}>
                    <Link href={`/feeds?uri=${encodeURIComponent(feed.uri)}`} legacyBehavior>
                      <a className="hover:text-sky-400 cursor-pointer px-2 py-1 rounded hover:bg-gray-700/50 transition-colors duration-150">
                        {feed.displayName}
                      </a>
                    </Link>
                    {index < pinnedFeeds.length - 1 && <span className="text-gray-600 mx-1 select-none">|</span>}
                  </React.Fragment>
                ))
              ) : (
                <>
                  {/* Default links if no pinned feeds, can also be Link components if they go somewhere */}
                  <span className="px-2 py-1 cursor-default">My Feed</span>
                  <span className="text-gray-600 mx-1 select-none">|</span>
                  <span className="px-2 py-1 cursor-default">Discover</span>
                </>
              )}
            </div>

            {/* Right: Feed Management Button */}
            <button className="p-2 rounded-full hover:bg-gray-700 flex items-center space-x-1 text-sm">
              <Hash size={18} />
              <span>Manage</span>
            </button>
          </nav>
        </>
      )}

      {/* Adjust flex-grow based on whether the bottom tab bar is hidden or not, and if the new top nav is present */}
      <main className={`flex-grow ${!hideTabBar ? 'pb-12' : ''} ${showHeader ? 'pt-0' : ''}`}>{children}</main>

      {!hideTabBar && (
        <nav className="sticky bottom-0 z-40 bg-black border-t border-gray-800"> {/* Ensure this nav is z-40 if new top nav is z-30 */}
          <div className="flex justify-around py-2">
            <Link href="/" className={`p-2 rounded-full ${pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home size={24} />
            </Link>
            <Link href="/explore" className={`p-2 rounded-full ${pathname.startsWith('/explore') ? 'text-blue-500' : 'text-gray-500'}`}>
              <Search size={24} />
            </Link>
            <Link href="/browser" className={`flex flex-col items-center p-2 rounded-full ${pathname === '/browser' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Globe size={24} />
              <span className="text-xs">Browser</span>
            </Link>
            <Link href="/chat" className={`p-2 rounded-full ${pathname.startsWith('/chat') ? 'text-blue-500' : 'text-gray-500'}`}>
              <MessageCircle size={24} />
            </Link>
            <Link href="/notifications" className={`p-2 rounded-full ${pathname === '/notifications' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Bell size={24} />
            </Link>
            <Link href="/profile" className={`p-2 rounded-full ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}>
              <User size={24} />
            </Link>
          </div>
        </nav>
      )}

      {/* Persistent Audio Iframe */}
      {audioUrl && (
        <iframe
          src={audioUrl}
          style={
            pathname === '/browser' && isPlaying
              ? { // Visible style (example: small banner at bottom)
                  position: 'fixed',
                  bottom: '50px', // Adjust to not overlap main nav if main nav is at bottom
                  left: '0',
                  width: '100%',
                  height: '60px', // Small height for a mini-player like experience
                  border: 'none',
                  zIndex: 100, // Ensure it's above other content but below modals if any
                  backgroundColor: '#222', // Dark background for the player
                }
              : { // Hidden but active style
                  position: 'absolute',
                  left: '-9999px',
                  top: '-9999px',
                  width: '1px',
                  height: '1px',
                  border: 'none',
                }
          }
          title="Persistent Audio Player"
          allow="autoplay; encrypted-media; picture-in-picture" // picture-in-picture might be useful for video
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      )}
    </div>
  );
};

export default AppLayout;

