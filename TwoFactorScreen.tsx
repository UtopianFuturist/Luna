"use client";

import React, { useState } from 'react';
import { colors } from '@/lib/colors';

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
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!code.trim()) {
      setError('Please enter the confirmation code');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await onNextClick(code);
    } catch (error) {
      console.error("TwoFactorScreen: Error during submission:", error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <div className="flex flex-col w-full max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-4">Check your email</h1>
        
        {/* Description */}
        <p className="text-gray-400 mb-8 text-lg">
          Enter the confirmation code that we sent to {identifier}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Confirmation Code Input */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 text-lg">
              Confirmation code
            </label>
            <div 
              className="flex items-center p-4 rounded-lg"
              style={{ backgroundColor: colors.darkInputBackground }}
            >
              <input
                type="text"
                placeholder="Enter confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-lg text-center tracking-widest"
                disabled={isLoading}
                maxLength={6}
              />
            </div>
          </div>
          
          {/* Resend Link */}
          <div className="text-center mb-8">
            <button 
              type="button" 
              className="text-blue-400 hover:text-blue-300 text-lg"
              disabled={isLoading}
            >
              Didn't receive a code?
            </button>
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
              disabled={isLoading || !code.trim()}
              className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center min-w-[100px] ${
                isLoading || !code.trim() ? 'opacity-50' : ''
              }`}
              style={{ backgroundColor: colors.vibrantBlue }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
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

export default TwoFactorScreen;

