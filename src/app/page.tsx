"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

const CallbackPage = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated, error } = useAuth();

  // Redirect to home if authenticated, or to sign-in if there's an error
  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/');
      } else if (error) {
        router.push('/signin');
      }
    }
  }, [isLoading, isAuthenticated, error, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold mb-2">Completing sign-in...</h2>
          <p className="text-gray-400">
            Please wait while we authenticate your account
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              <p>Authentication failed: {error}</p>
              <p className="mt-2 text-sm">
                You will be redirected to the sign-in page shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;
