"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Bell, MessageCircle, User, Settings, Globe, X, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, agent, signOut } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div 
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center">
              <Image
                src="/OmniSky_Logo.jpeg"
                alt="OmniSky Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-xl font-bold ml-3">OmniSky</h1>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow py-4">
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Home size={20} className="mr-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/explore"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Search size={20} className="mr-4" />
                  <span>Explore</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/notifications"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Bell size={20} className="mr-4" />
                  <span>Notifications</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/chat"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <MessageCircle size={20} className="mr-4" />
                  <span>Messages</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <User size={20} className="mr-4" />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/browser"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Globe size={20} className="mr-4" />
                  <span>Browser</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/widget-board-settings"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <LayoutGrid size={20} className="mr-4" />
                  <span>Widget Board</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/create-account"
                  className="flex items-center px-4 py-3 text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Settings size={20} className="mr-4" />
                  <span>Create Shapes Account</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            {isAuthenticated && (
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

