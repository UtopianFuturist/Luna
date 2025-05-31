"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '../AuthContext';
import { BrowserAudioProvider } from '../contexts/BrowserAudioContext'; // Adjust path as needed
import ProtectedRoute from '../ProtectedRoute';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BrowserAudioProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </BrowserAudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
