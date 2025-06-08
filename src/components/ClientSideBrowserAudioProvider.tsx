// src/components/ClientSideBrowserAudioProvider.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the actual BrowserAudioProvider with SSR turned off
const DynamicallyLoadedBrowserAudioProvider = dynamic(
  () => import('@/contexts/BrowserAudioContext').then(mod => mod.BrowserAudioProvider),
  { ssr: false }
);

interface ClientSideBrowserAudioProviderProps {
  children: React.ReactNode;
}

const ClientSideBrowserAudioProvider: React.FC<ClientSideBrowserAudioProviderProps> = ({ children }) => {
  return <DynamicallyLoadedBrowserAudioProvider>{children}</DynamicallyLoadedBrowserAudioProvider>;
};

export default ClientSideBrowserAudioProvider;
