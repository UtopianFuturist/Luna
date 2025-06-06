"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { emailLinkLogin, isLoading: authIsLoading, error: authError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [emailToken, setEmailToken] = useState('');

  const [needsEmailToken, setNeedsEmailToken] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from pageIsLoading to avoid conflict

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsProcessing(true);

    if (!identifier.trim()) {
      setFormError("Username/handle cannot be empty.");
      setIsProcessing(false);
      return;
    }
    if (!password.trim()) {
      setFormError("Password cannot be empty.");
      setIsProcessing(false);
      return;
    }
    if (needsEmailToken && !emailToken.trim()) {
      setFormError("Email confirmation code cannot be empty.");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await emailLinkLogin(identifier, password, needsEmailToken ? emailToken : undefined);

      if (result.success) {
        router.push('/');
      } else if (result.needsEmailToken) {
        setNeedsEmailToken(true);
        setFormError(result.error || 'Please enter the confirmation code sent to your email.');
      } else {
        setFormError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  // Combined loading state for disabling form elements
  const formIsDisabled = authIsLoading || isProcessing;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-100 p-4">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-50">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block mb-2 text-sm font-medium text-gray-300">Username or Handle</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="your.handle or did:plc:..."
              disabled={formIsDisabled}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={formIsDisabled}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
            />
          </div>
          {needsEmailToken && (
            <div>
              <label htmlFor="emailToken" className="block mb-2 text-sm font-medium text-gray-300">Email Confirmation Code</label>
              <input
                type="text"
                id="emailToken"
                value={emailToken}
                onChange={(e) => setEmailToken(e.target.value)}
                placeholder="123456"
                disabled={formIsDisabled}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          )}
          {formError && (
            <div className="p-3 mb-4 text-sm text-red-300 bg-red-900/40 border border-red-700 rounded-lg text-center">
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={formIsDisabled}
            className="w-full py-3 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {formIsDisabled ? 'Processing...' : (needsEmailToken ? 'Confirm Code & Sign In' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
}
