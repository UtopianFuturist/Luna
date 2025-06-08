// src/app/signin/page.tsx
"use client"; // Required for using client-side hooks like useRouter or useAuth

import React from 'react';
import SignInFlow from '@/components/SignInFlow'; // Path alias for components
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // Corrected import for App Router

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If user is already authenticated, redirect them from sign-in page
  if (isAuthenticated) {
    router.replace('/'); // Redirect to home or dashboard
    return null; // Render nothing while redirecting
  }

  return <SignInFlow />;
}
