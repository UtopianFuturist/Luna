// src/app/layout.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
// import { BrowserAudioProvider } from '@/contexts/BrowserAudioContext';
import ProtectedRoute from '@/components/ProtectedRoute'; // Path alias for components

const BrowserAudioProvider = dynamic(
  () => import('@/contexts/BrowserAudioContext').then(mod => mod.BrowserAudioProvider),
  { ssr: false }
);

export const metadata = {
  title: 'OmniSky - The Everything Client',
  description: 'Access multiple Sky online services with one universal client.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BrowserAudioProvider>
            {/* ProtectedRoute will now gate access to `children` */}
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </BrowserAudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
