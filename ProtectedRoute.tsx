"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Skip redirect for signin and callback pages
    const isAuthPage = pathname === '/signin' || pathname === '/callback' || pathname === '/create-account';
    
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        // Redirect to signin if not authenticated and not on an auth page
        router.push('/signin');
      } else if (isAuthenticated && isAuthPage) {
        // Redirect to home if authenticated and on an auth page
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For auth pages, render children regardless of auth state
  const isAuthPage = pathname === '/signin' || pathname === '/callback' || pathname === '/create-account';
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For protected pages, only render if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
