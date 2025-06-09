// src/app/signin/page.tsx
"use client"; // Required for using client-side hooks like useRouter or useAuth

import React from 'react';
// import { useAuth } from '@/contexts/AuthContext'; // Temporarily commented out
// import { useRouter } from 'next/navigation'; // Temporarily commented out
// import dynamic from 'next/dynamic'; // Temporarily commented out

// Dynamically import SignInFlow with SSR turned off
// const SignInFlow = dynamic(() => import('@/components/SignInFlow'), {
//   ssr: false,
//   loading: () => <div className="flex justify-center items-center min-h-screen">Loading flow...</div> // Optional loading state
// });

export default function SignInPage() {
  // const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Temporarily commented out
  // const router = useRouter(); // Temporarily commented out

  // if (authIsLoading) { // Temporarily commented out
  //   return <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  // }

  // // If user is already authenticated, redirect them from sign-in page
  // if (isAuthenticated) { // Temporarily commented out
  //   router.replace('/'); // Redirect to home or dashboard
  //   return null; // Render nothing while redirecting
  // }

  // return <SignInFlow />; // Temporarily commented out
  return <div>This is a simplified sign-in page test.</div>;
}
