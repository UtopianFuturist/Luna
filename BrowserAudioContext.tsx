"use client";

import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface BrowserAudioContextProps {
  audioUrl: string | null;
  setAudioUrl: Dispatch<SetStateAction<string | null>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

export const BrowserAudioContext = createContext<BrowserAudioContextProps | undefined>(undefined);

interface BrowserAudioProviderProps {
  children: ReactNode;
}

export const BrowserAudioProvider: React.FC<BrowserAudioProviderProps> = ({ children }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <BrowserAudioContext.Provider value={{ audioUrl, setAudioUrl, isPlaying, setIsPlaying }}>
      {children}
    </BrowserAudioContext.Provider>
  );
};

