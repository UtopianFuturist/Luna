// src/app/layout.tsx
import React from 'react';
// No longer need next/dynamic here for BrowserAudioProvider
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute'; // Path alias for components
import ClientSideBrowserAudioProvider from '@/components/ClientSideBrowserAudioProvider';

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
          <ClientSideBrowserAudioProvider>
            {/* ProtectedRoute will now gate access to `children` */}
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </ClientSideBrowserAudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
