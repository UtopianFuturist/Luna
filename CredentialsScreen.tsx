// Fixed version of CredentialsScreen.tsx

"use client";

import React, { useState } from 'react';
import { colors } from './colors';

interface CredentialsScreenProps {
  onBackClick: () => void;
  onNextClick: (identifier: string, password: string) => void;
}

const CredentialsScreen: React.FC<CredentialsScreenProps> = ({ 
  onBackClick, 
  onNextClick 
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!identifier.trim()) {
      setError('Please enter your username or email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Call the onNextClick function provided by the parent component
      await onNextClick(identifier, password);
    } catch (error) {
      console.error("CredentialsScreen: Error during submission:", error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <div className="flex flex-col w-full max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">Sign in</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        
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
              <input
                type="text"
                placeholder="Username or email address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-lg"
                disabled={isLoading}
              />
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
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-lg"
                  disabled={isLoading}
                />
              </div>
              <button type="button" className="text-gray-400" disabled={isLoading}>
                Forgot?
              </button>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onBackClick}
              className="px-8 py-3 rounded-lg text-lg font-medium"
              style={{ backgroundColor: colors.darkGray }}
              disabled={isLoading}
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center min-w-[100px] ${
                isLoading ? 'opacity-70' : ''
              }`}
              style={{ backgroundColor: colors.vibrantBlue }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialsScreen;

