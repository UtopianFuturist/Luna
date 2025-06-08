"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic'; // Ensures dynamic rendering

const CallbackPage = () => {
  const router = useRouter();
  const { isLoading: authIsLoading, isAuthenticated, error } = useAuth();

  React.useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated) {
        router.push('/');
      } else if (error) {
        // If there's an error, redirect to signin.
        // The error state in AuthContext should be set by the OAuth flow if callback fails.
        router.push('/signin');
      }
      // If not authenticated, not loading, and no specific error,
      // this page will continue showing "Completing sign-in..."
      // or the yellow box if that condition is met.
      // This state might occur if the OAuth callback completes without an error
      // but also without authenticating the user (e.g., user denied consent, or other provider issues).
    }
  }, [authIsLoading, isAuthenticated, error, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100 items-center justify-center p-4">
      <div className="text-center p-8 max-w-md w-full">
        <Loader2 className="animate-spin h-12 w-12 mx-auto mb-6 text-blue-500" />
        <h2 className="text-2xl font-semibold mb-3 text-gray-50">Completing sign-in...</h2>
        <p className="text-gray-400 mb-8">
          Please wait while we authenticate your account.
        </p>
        {error && !authIsLoading && (
          <div className="mt-6 p-4 text-sm text-red-300 bg-red-900/40 border border-red-700 rounded-lg">
            <p className="font-medium">Authentication Failed:</p>
            <p>{error}</p>
            <p className="mt-2 text-xs text-gray-400">
              You will be redirected to the sign-in page. If not, please click <a href="/signin" className="underline hover:text-blue-400">here</a>.
            </p>
          </div>
        )}
        {!authIsLoading && !isAuthenticated && !error && (
            <div className="mt-6 p-4 text-sm text-yellow-300 bg-yellow-900/40 border border-yellow-700 rounded-lg">
                <p>Could not complete authentication. Please try <a href="/signin" className="underline hover:text-blue-400">signing in</a> again.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage;
