// src/components/AppLayout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, Bell, User, Search, Menu, X, Settings, LogOut, Globe, Hash } from 'lucide-react';
import UserMenu from './UserMenu'; // Assuming UserMenu is in the same directory
import { useAuth } from '@/contexts/AuthContext'; // Path alias

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { agent } = useAuth(); // Get agent from AuthContext
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };
  
  // Close sidebar on route change if it's open (for mobile)
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);


  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Feeds', icon: Globe, path: '/feeds' },
    { name: 'Chat', icon: MessageCircle, path: '/chat' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Profile', icon: User, path: `/profile/${agent?.session?.handle || ''}` },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <Link href="/" legacyBehavior>
          <a className="text-2xl font-bold text-white">OmniSky</a>
        </Link>
      </div>
      <nav className="flex-grow p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path)}
            disabled={item.name === 'Profile' && !agent?.session?.handle}
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors
              ${pathname === item.path ? 'bg-sky-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              ${item.name === 'Profile' && !agent?.session?.handle ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-gray-700">
        <UserMenu />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-gray-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar & Backdrop */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 md:hidden transform transition-transform duration-300 ease-in-out"
                 style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 shadow-md md:bg-gray-900">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-300 hover:text-white"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden md:block text-xl font-semibold">
              {/* Display current page title or leave empty */}
            </div>
            <div className="flex-1 flex justify-center md:justify-start">
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="block w-full bg-gray-700 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-sky-500 focus:text-gray-900"
                />
              </div>
            </div>
            <div className="md:hidden"> {/* Placeholder for UserMenu on mobile if needed, or remove */}
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
