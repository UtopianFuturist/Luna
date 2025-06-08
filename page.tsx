"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout'; // Adjusted path to AppLayout

// You might want to import and use your actual AuthContext here
// if you need to check auth state directly on this page,
// though AppLayout and ProtectedRoute should handle most of that.
// import { useAuth } from './AuthContext';

export default function RootPage() {
  // const { isAuthenticated } = useAuth(); // Example if you need auth status

  // ProtectedRoute in the main layout (src/app/layout.tsx or layout.tsx)
  // should handle redirecting unauthenticated users.
  // So, if we reach here, the user should be authenticated.

  return (
    <AppLayout currentPage="Home" showHeader={true} showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Welcome to OmniSky!</h1>
        <p>This is your main application page after login.</p>
        {/* Add your main dashboard/home page content here */}
      </div>
    </AppLayout>
  );
}
