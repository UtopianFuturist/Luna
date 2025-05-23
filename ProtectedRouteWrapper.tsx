"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default ProtectedRouteWrapper;
