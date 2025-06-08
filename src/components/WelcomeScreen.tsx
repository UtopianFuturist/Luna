// src/components/WelcomeScreen.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { colors } from '@/lib/colors'; // Path alias

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
        <div className="mb-4 relative w-32 h-32">
          <Image 
            src="/OmniSky_Logo.jpeg" // Assumes logo is in public directory
            alt="OmniSky Logo" 
            width={128}
            height={128}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        
        <h1 className="text-5xl font-bold mb-2 text-white">OmniSky</h1>
        <p className="text-xl text-gray-400 mb-12">The Everything Client!</p>
        
        <button
          onClick={onSignInClick}
          className="w-full py-4 mb-4 text-white font-semibold rounded-lg text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.vibrantBlue }}
        >
          Sign in
        </button>
        
        <button
          onClick={onCreateAccountClick}
          className="w-full py-4 mb-12 text-white font-semibold rounded-lg text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.darkGray }} // Differentiate create account
        >
          Create account
        </button>
        
        <div className="flex items-center text-gray-400 cursor-pointer hover:text-gray-200">
          <span>English</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18"
            height="18"
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
    </div>
  );
};

export default WelcomeScreen;
