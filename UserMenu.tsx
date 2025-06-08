"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { signOut, session } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
    onClose();
  };

  const handleProfileClick = () => {
    router.push('/profile');
    onClose();
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-3 border-b border-gray-700">
        <p className="font-medium text-sm truncate">{session?.sub || 'User'}</p>
        <p className="text-xs text-gray-400 truncate">{session?.aud || '@user.bsky.social'}</p>
      </div>
      <div className="py-1">
        <button
          onClick={handleProfileClick}
          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
        >
          <User size={16} className="mr-2" />
          Profile
        </button>
        <button
          onClick={handleSettingsClick}
          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
        >
          <Settings size={16} className="mr-2" />
          Settings
        </button>
      </div>
      <div className="border-t border-gray-700 py-1">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
        >
          <LogOut size={16} className="mr-2" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
