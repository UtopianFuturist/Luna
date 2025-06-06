"use client";

import React from 'react'; // useEffect is used implicitly by React for the component lifecycle
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../AuthContext'; // Adjusted path

const CallbackPage = () => {
  const router = useRouter();
  // Renaming isLoading from useAuth to authIsLoading for clarity if page had its own loading state
  const { isLoading: authIsLoading, isAuthenticated, error } = useAuth();

  React.useEffect(() => {
    if (!authIsLoading) { // Use authIsLoading here
      if (isAuthenticated) {
        router.push('/');
      } else if (error) {
        router.push('/signin');
      }
      // If !isAuthenticated and no error, and auth is not loading,
      // it implies the callback didn't result in authentication.
      // Showing the loader might be misleading.
      // However, often callbacks *do* involve a period where isLoading is true from useAuth
      // as the session is finalized. The current UI shows "Completing sign-in..."
      // which is appropriate if isLoading (authIsLoading) is still true or expected to become true.
      // If authIsLoading is false, and user is not authenticated, and no error,
      // a redirect to /signin might also be appropriate here, or a message.
      // For now, keeping existing logic which relies on error to redirect.
    }
  }, [authIsLoading, isAuthenticated, error, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100 items-center justify-center p-4">
      <div className="text-center p-8 max-w-md w-full">
        {/* Display loader if auth is still processing, or if no specific error/auth state forces a redirect yet */}
        {/* This UI is primarily for the case where authIsLoading is true, or just became false but redirect is pending */}
        <Loader2 className="animate-spin h-12 w-12 mx-auto mb-6 text-blue-500" />
        <h2 className="text-2xl font-semibold mb-3 text-gray-50">Completing sign-in...</h2>
        <p className="text-gray-400 mb-8">
          Please wait while we authenticate your account.
        </p>

        {error && !authIsLoading && ( // Only show error if auth is not loading (error might be from a previous attempt)
          <div className="mt-6 p-4 text-sm text-red-300 bg-red-900/40 border border-red-700 rounded-lg">
            <p className="font-medium">Authentication Failed:</p>
            <p>{error}</p>
            <p className="mt-2 text-xs text-gray-400">
              You will be redirected to the sign-in page. If not, please click <a href="/signin" className="underline hover:text-blue-400">here</a>.
            </p>
          </div>
        )}

        {/* Fallback for unexpected state: auth not loading, not authenticated, and no error */}
        {/* This might indicate the callback completed without authenticating the user, without an explicit error from useAuth */}
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
