"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from '../../utils/colors';

interface WelcomeScreenProps {
  onSignInClick: () => void;
  onCreateAccountClick: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onSignInClick, 
  onCreateAccountClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Logo */}
        <div className="mb-4 relative w-32 h-32">
          <Image 
            src="/OmniSky_Logo.jpeg" 
            alt="OmniSky Logo" 
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-5xl font-bold mb-2 text-white">OmniSky</h1>
        
        {/* Tagline */}
        <p className="text-xl text-gray-400 mb-12">The Everything Client!</p>
        
        {/* Sign In Button */}
        <button
          onClick={onSignInClick}
          className="w-full py-4 mb-4 text-white font-semibold rounded-lg text-lg"
          style={{ backgroundColor: colors.vibrantBlue }}
        >
          Sign in
        </button>
        
        {/* Create Account Button */}
        <button
          onClick={onCreateAccountClick}
          className="w-full py-4 mb-12 text-white font-semibold rounded-lg text-lg"
          style={{ backgroundColor: colors.vibrantBlue }}
        >
          Create account
        </button>
        
        {/* Language Selector */}
        <div className="flex items-center text-gray-400">
          <span>English</span>
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
            className="ml-1"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
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

export default WelcomeScreen;

