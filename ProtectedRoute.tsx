"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Adjusted path assuming AuthContext is at root src
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/signin' || pathname === '/callback' || pathname === '/create-account';

  // Show loading spinner only for non-auth pages while auth state is loading
  if (isLoading && !isAuthPage) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle redirects once auth state is resolved (isLoading is false)
  if (!isLoading) {
    if (!isAuthenticated && !isAuthPage) {
      router.push('/signin');
      return null; // Important: return null to prevent rendering children during redirect
    } else if (isAuthenticated && isAuthPage) {
      router.push('/');
      return null; // Important: return null to prevent rendering children during redirect
    }
  }

  // If not loading and no redirect is needed, or if it's an auth page (even if loading), render children.
  // This allows auth pages like SignInFlow to manage their own UI during the auth process without being unmounted.
  return <>{children}</>;
};

export default ProtectedRoute;
