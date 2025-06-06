"use client";

import React, { useState } from 'react';
import { colors } from '../../utils/colors';

interface TwoFactorScreenProps {
  onBackClick: () => void;
  onNextClick: (code: string) => void;
  identifier: string;
}

const TwoFactorScreen: React.FC<TwoFactorScreenProps> = ({ 
  onBackClick, 
  onNextClick,
  identifier
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onNextClick(confirmationCode);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <div className="flex flex-col w-full max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">Sign in</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hosting Provider Section */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-lg">
              Hosting provider
            </label>
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-3 text-gray-400"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                <span className="text-lg">Bluesky Social</span>
              </div>
              <button type="button">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-gray-400"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Account Section */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-lg">
              Account
            </label>
            <div 
              className="flex items-center p-4 rounded-lg mb-4"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-3 text-gray-400"
              >
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 0 0-16 0"/>
              </svg>
              <span className="text-gray-400 text-lg">Account information hidden</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <div className="flex items-center w-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-3 text-gray-400"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-gray-400 text-lg">••••••••</span>
              </div>
              <button type="button" className="text-gray-400">
                Forgot?
              </button>
            </div>
          </div>
          
          {/* 2FA Section */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-lg">
              2FA Confirmation
            </label>
            <div 
              className="flex items-center p-4 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-3 text-gray-400"
              >
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="16" y2="16"/>
              </svg>
              <input
                type="text"
                placeholder="Confirmation code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-lg"
              />
            </div>
            <p className="text-gray-400 mt-3">
              Check your email for a sign in code and enter it here.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onBackClick}
              className="px-8 py-3 rounded-lg text-lg font-medium"
              style={{ backgroundColor: colors.darkGray }}
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 rounded-lg text-lg font-medium"
              style={{ backgroundColor: colors.vibrantBlue }}
            >
              Next
            </button>
          </div>
        </form>
      </div>
      
      {/* Made with Manus */}
      <div 
        className="fixed bottom-20 right-8 bg-gray-800 rounded-full px-4 py-2 flex items-center"
      >
        <span className="mr-2">Made with Manus</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
          <path d="M8.5 8.5v.01"/>
          <path d="M16 15.5v.01"/>
          <path d="M12 12v.01"/>
          <path d="M11 17v.01"/>
          <path d="M7 14v.01"/>
        </svg>
      </div>
    </div>
  );
};

export default TwoFactorScreen;

