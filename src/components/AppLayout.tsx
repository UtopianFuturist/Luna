"use client";

import React, { useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell, Home, Search, MessageCircle, User, Settings, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BrowserAudioContext } from '../contexts/BrowserAudioContext'; // Adjust path if needed
import UserMenu from './UserMenu';

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
  const { isAuthenticated, session } = useAuth();
  const browserAudioCtx = useContext(BrowserAudioContext);

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
        <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              {showSidebarButton && (
                <button className="p-2 rounded-full hover:bg-gray-800">
                  <Menu size={20} />
                </button>
              )}
              <h1 className="text-xl font-bold ml-2">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-full hover:bg-gray-800"
              >
                <Image
                  src="/shapes_logo.jpeg"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </button>
              <UserMenu isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow">{children}</main>

      {!hideTabBar && (
        <nav className="sticky bottom-0 z-40 bg-black border-t border-gray-800">
          <div className="flex justify-around py-2">
            <Link href="/" className={`p-2 rounded-full ${currentPage === 'home' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home size={24} />
            </Link>
            <Link href="/explore" className={`p-2 rounded-full ${currentPage === 'explore' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Search size={24} />
            </Link>
            <Link href="/browser" className={`flex flex-col items-center p-2 rounded-full ${pathname === '/browser' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Globe size={24} />
              <span className="text-xs">Browser</span>
            </Link>
            <Link href="/chat" className={`p-2 rounded-full ${currentPage === 'chat' ? 'text-blue-500' : 'text-gray-500'}`}>
              <MessageCircle size={24} />
            </Link>
            <Link href="/notifications" className={`p-2 rounded-full ${currentPage === 'notifications' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Bell size={24} />
            </Link>
            <Link href="/create-account" className={`p-2 rounded-full ${currentPage === 'create' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Settings size={24} />
            </Link>
            <Link href="/profile" className={`p-2 rounded-full ${currentPage === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}>
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
