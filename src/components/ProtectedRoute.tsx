// src/components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Path alias
import { useRouter, usePathname } from 'next/navigation'; // Corrected for App Router

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, session } = useAuth(); // session might be useful for role checks later
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication status to resolve
    }

    const isSignInPage = pathname === '/signin';

    if (!isAuthenticated && !isSignInPage) {
      // If not authenticated and not on the sign-in page, redirect to sign-in
      router.replace('/signin');
    } else if (isAuthenticated && isSignInPage) {
      // If authenticated and on the sign-in page, redirect to home
      router.replace('/');
    }
    // If authenticated and not on sign-in, or not authenticated and on sign-in, allow access
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state or a splash screen while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading session...
      </div>
    );
  }

  // If user is authenticated OR they are on the sign-in page, render children
  // This prevents a flash of the sign-in page if already authenticated and navigating.
  // Also allows the sign-in page to render if not authenticated.
  if (isAuthenticated || pathname === '/signin') {
    return <>{children}</>;
  }

  // If not authenticated and not on sign-in page, effectively renders nothing
  // as the redirect should have already been initiated.
  // You could also return a dedicated "Redirecting..." component here.
  return null;
};

export default ProtectedRoute;
