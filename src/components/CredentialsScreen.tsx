// src/components/CredentialsScreen.tsx
"use client";

import React, { useState } from 'react';
import { colors } from '@/lib/colors'; // Path alias
import { Globe, User, Lock, Edit3 } from 'lucide-react'; // Icons

interface CredentialsScreenProps {
  onBackClick: () => void;
  onNextClick: (identifier: string, password: string) => void;
  isLoading?: boolean; // Make isLoading optional as it's managed by SignInFlow
  error?: string | null; // Make error optional
}

const CredentialsScreen: React.FC<CredentialsScreenProps> = ({
  onBackClick,
  onNextClick,
  isLoading = false, // Default value
  error = null,      // Default value
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Internal error state for local validation, parent error prop for submission errors
  const [localError, setLocalError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear local errors

    if (!identifier.trim()) {
      setLocalError('Please enter your username or email address.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }
    onNextClick(identifier, password);
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Sign in</h1>

      {displayError && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-sm">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-400 mb-1.5 text-sm">
            Hosting provider
          </label>
          <div
            className="flex items-center justify-between p-3.5 rounded-lg"
            style={{ backgroundColor: colors.darkInputBackground }}
          >
            <div className="flex items-center">
              <Globe size={20} className="mr-2.5 text-gray-500" />
              <span className="text-base text-gray-200">Bluesky Social</span>
            </div>
            <button type="button" className="text-gray-500 hover:text-gray-300">
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-1.5 text-sm">
            Account
          </label>
          <div className="space-y-3">
            <div
              className="flex items-center p-3.5 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <User size={20} className="mr-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-base text-gray-200 placeholder-gray-500"
                disabled={isLoading}
              />
            </div>

            <div
              className="flex items-center justify-between p-3.5 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <div className="flex items-center w-full">
                <Lock size={20} className="mr-2.5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password (app password recommended)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-base text-gray-200 placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
              <button type="button" className="text-sm text-sky-400 hover:text-sky-300 whitespace-nowrap" disabled={isLoading}>
                Forgot?
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3">
          <button
            type="button"
            onClick={onBackClick}
            className="px-6 py-2.5 rounded-lg text-base font-medium"
            style={{ backgroundColor: colors.darkGray, color: colors.lightText }}
            disabled={isLoading}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-7 py-2.5 rounded-lg text-base font-medium flex items-center justify-center min-w-[90px] transition-opacity ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: colors.vibrantBlue, color: colors.white }}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CredentialsScreen;
