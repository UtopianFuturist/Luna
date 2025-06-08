// src/components/TwoFactorScreen.tsx
"use client";

import React, { useState } from 'react';
import { colors } from '@/lib/colors'; // Path alias
import { Globe, User, Lock, ShieldCheck } from 'lucide-react'; // Icons

interface TwoFactorScreenProps {
  onBackClick: () => void;
  onNextClick: (code: string) => void;
  identifier: string; // To display which account is being verified
  isLoading?: boolean;
  error?: string | null;
}

const TwoFactorScreen: React.FC<TwoFactorScreenProps> = ({
  onBackClick,
  onNextClick,
  identifier,
  isLoading = false,
  error = null,
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!confirmationCode.trim()) {
      setLocalError('Please enter the confirmation code.');
      return;
    }
    onNextClick(confirmationCode);
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Two-Factor Authentication</h1>

      {displayError && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-sm">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-400 mb-1.5 text-sm">
            Verifying account
          </label>
          <div
            className="flex items-center p-3.5 rounded-lg bg-opacity-50" // Slightly different style for readonly info
            style={{ backgroundColor: colors.darkInputBackground }}
          >
            <User size={20} className="mr-2.5 text-gray-500" />
            <span className="text-base text-gray-400">{identifier}</span>
          </div>
        </div>

        <div>
          <label htmlFor="confirmationCode" className="block text-gray-400 mb-1.5 text-sm">
            Confirmation Code
          </label>
          <div
            className="flex items-center p-3.5 rounded-lg"
            style={{ backgroundColor: colors.darkInputBackground }}
          >
            <ShieldCheck size={20} className="mr-2.5 text-gray-500" />
            <input
              id="confirmationCode"
              type="text"
              placeholder="Enter code from your email"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-base text-gray-200 placeholder-gray-500"
              disabled={isLoading}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5 px-1">
            Check your email for a sign-in code and enter it here.
          </p>
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
              'Verify'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorScreen;
