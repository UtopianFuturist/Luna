"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell, Home, Search, MessageCircle, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
            <Link href="/shapes-inc" className={`p-2 rounded-full ${currentPage === 'shapes' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Image
                src="/shapes_logo.jpeg"
                alt="Shapes"
                width={24}
                height={24}
                className="rounded-full"
              />
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
    </div>
  );
};

export default AppLayout;
