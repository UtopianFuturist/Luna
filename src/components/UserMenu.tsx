// src/components/UserMenu.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Path alias
import { User, Settings, LogOut } from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image component

const UserMenu: React.FC = () => {
  const { agent, signOut, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userHandle = agent?.session?.handle || 'Guest';
  // Use a placeholder or default avatar if not available or not authenticated
  const avatarUrl = isAuthenticated && agent?.session?.did ? `/api/avatar/${agent.session.did}` : '/default-avatar.png';


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null; // Don't show the menu if not authenticated
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
          {/* Use Next.js Image component */}
          <Image
            src={avatarUrl}
            alt={userHandle}
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <span className="hidden md:block text-sm font-medium text-white">{userHandle}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <button
            onClick={() => { /* Navigate to profile */ setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            role="menuitem"
          >
            <User size={16} className="mr-2" /> Profile
          </button>
          <button
            onClick={() => { /* Navigate to settings */ setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            role="menuitem"
          >
            <Settings size={16} className="mr-2" /> Settings
          </button>
          <button
            onClick={() => { signOut(); setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            role="menuitem"
          >
            <LogOut size={16} className="mr-2" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
