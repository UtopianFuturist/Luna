"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell, Home, Search, MessageCircle, User, Settings, Globe, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';
import Sidebar from './Sidebar';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  // Hide bottom tab bar on welcome, signin, and account creation pages
  const hideTabBar = ['/welcome', '/signin', '/create-account', '/callback'].includes(pathname);

  // Only show the layout if authenticated or on non-protected routes
  if (!isAuthenticated && !hideTabBar) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {showHeader && (
        <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              {showSidebarButton && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
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
            <Link href="/" className={`p-2 rounded-full ${pathname === '/' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home size={24} />
            </Link>
            <Link href="/explore" className={`p-2 rounded-full ${pathname === '/explore' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Search size={24} />
            </Link>
            <Link href="/shapes-inc" className={`p-2 rounded-full ${pathname === '/shapes-inc' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Globe size={24} />
            </Link>
            <Link href="/chat" className={`p-2 rounded-full ${pathname === '/chat' ? 'text-blue-500' : 'text-gray-500'}`}>
              <MessageCircle size={24} />
            </Link>
            <Link href="/notifications" className={`p-2 rounded-full ${pathname === '/notifications' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Bell size={24} />
            </Link>
            <Link href="/chatbots" className={`p-2 rounded-full ${pathname === '/chatbots' ? 'text-blue-500' : 'text-gray-500'}`}>
              <Sparkles size={24} />
            </Link>
            <Link href="/profile" className={`p-2 rounded-full ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}>
              <User size={24} />
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
