// src/app/page.tsx
"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import WelcomeScreen from '@/components/WelcomeScreen';
import SignInFlow from '@/components/SignInFlow';

export default function HomePage() {
  const { isAuthenticated, isLoading, error: authError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading authentication status...
      </div>
    );
  }

  if (authError) {
    // This is a basic way to show auth system errors on the main page.
    // You might want a more sophisticated error display, perhaps a toast or modal.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
        <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{authError}</p>
        <p className="mt-4 text-sm text-gray-400">
          Please try refreshing the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // If not authenticated and not loading, show WelcomeScreen or SignInFlow
  // For this example, let's assume WelcomeScreen handles the choice or leads to SignInFlow
  if (!isAuthenticated) {
    // Directly using SignInFlow for simplicity in this example
    // In a real app, WelcomeScreen might be shown first, then navigate to SignInFlow
    return <SignInFlow />;
  }

  // If authenticated, show the main app content within AppLayout
  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-xl font-semibold text-white">Welcome to OmniSky</h1>
        <p className="text-gray-300">You are successfully logged in!</p>
        {/* Add more dashboard content here */}
      </div>
    </AppLayout>
  );
}
