"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { colors } from './colors';

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
      
    </div>
  );
};

export default WelcomeScreen;

