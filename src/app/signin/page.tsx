// src/app/signin/page.tsx
"use client"; // Required for using client-side hooks like useRouter or useAuth

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // Corrected import for App Router
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import SignInFlow with SSR turned off
const SignInFlow = dynamic(() => import('@/components/SignInFlow'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center min-h-screen">Loading flow...</div> // Optional loading state
});

export default function SignInPage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Renamed isLoading to authIsLoading
  const router = useRouter();

  if (authIsLoading) { // Use authIsLoading from useAuth
    return <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  }

  // If user is already authenticated, redirect them from sign-in page
  if (isAuthenticated) {
    router.replace('/'); // Redirect to home or dashboard
    return null; // Render nothing while redirecting
  }

  return <SignInFlow />;
}
