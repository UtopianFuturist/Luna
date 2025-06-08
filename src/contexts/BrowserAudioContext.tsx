// src/contexts/BrowserAudioContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface BrowserAudioContextType {
  isSupported: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playRecording: () => Promise<void>;
  stopPlaying: () => void;
  resetAudio: () => void;
  duration: number; // Duration of the recording in seconds
  currentTime: number; // Current playback time in seconds
}

const BrowserAudioContext = createContext<BrowserAudioContextType | undefined>(undefined);

export const useBrowserAudio = () => {
  const context = useContext(BrowserAudioContext);
  if (!context) {
    throw new Error('useBrowserAudio must be used within a BrowserAudioProvider');
  }
  return context;
};

interface BrowserAudioProviderProps {
  children: ReactNode;
}

export const BrowserAudioProvider: React.FC<BrowserAudioProviderProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError("Browser audio recording is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (audioUrl && typeof window !== 'undefined') {
      const newAudio = new Audio(audioUrl);
      newAudio.onloadedmetadata = () => setDuration(newAudio.duration);
      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      newAudio.ontimeupdate = () => setCurrentTime(newAudio.currentTime);
      setAudioElement(newAudio);
      return () => { // Cleanup
        newAudio.pause();
        setAudioElement(null);
      };
    } else if (!audioUrl) {
      setAudioElement(null);
      setDuration(0);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  // Recording duration timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (isRecording && recordingStartTime) {
      timerInterval = setInterval(() => {
        setDuration((Date.now() - recordingStartTime) / 1000);
      }, 100); // Update duration every 100ms for smoother UI
    }
    return () => clearInterval(timerInterval);
  }, [isRecording, recordingStartTime]);


  const startRecording = useCallback(async () => {
    if (!isSupported || isRecording) return;
    setError(null);
    resetAudio(); // Clear previous recording before starting a new one

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        setMediaRecorder(null); // Clear mediaRecorder instance
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Error during recording.");
        setIsRecording(false);
        setRecordingStartTime(null);
        setDuration(0);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setDuration(0); // Reset duration at start of new recording

    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Please ensure microphone access is allowed.");
      setIsRecording(false);
    }
  }, [isSupported, isRecording, resetAudio]); // Added resetAudio to dependencies

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      // The actual audioUrl creation is now in the useEffect hook for audioChunks
    }
  }, [mediaRecorder, isRecording]);

  // Effect to process audio chunks when recording stops
  useEffect(() => {
    if (!isRecording && audioChunks.length > 0 && typeof window !== 'undefined') {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // or 'audio/ogg' or 'audio/mp3' if supported
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setAudioChunks([]); // Clear chunks after processing
    }
  }, [isRecording, audioChunks]);


  const playRecording = useCallback(async () => {
    if (audioElement && !isPlaying) {
      try {
        await audioElement.play();
        setIsPlaying(true);
        setError(null);
      } catch (err) {
        console.error("Error playing audio:", err);
        setError("Could not play audio.");
        setIsPlaying(false);
      }
    }
  }, [audioElement, isPlaying]);

  const stopPlaying = useCallback(() => {
    if (audioElement && isPlaying) {
      audioElement.pause();
      audioElement.currentTime = 0; // Reset to start
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioElement, isPlaying]);

  const resetAudio = useCallback(() => {
    stopPlaying();
    if (audioUrl && typeof window !== 'undefined') {
      URL.revokeObjectURL(audioUrl); // Clean up blob URL
    }
    setAudioUrl(null);
    setAudioChunks([]);
    setAudioElement(null);
    setIsRecording(false);
    setIsPlaying(false);
    setError(null);
    setDuration(0);
    setCurrentTime(0);
    setRecordingStartTime(null);
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop(); // Ensure recorder is stopped
    }
  }, [audioUrl, stopPlaying, mediaRecorder]);


  return (
    <BrowserAudioContext.Provider value={{
      isSupported,
      isRecording,
      isPlaying,
      audioUrl,
      error,
      startRecording,
      stopRecording,
      playRecording,
      stopPlaying,
      resetAudio,
      duration,
      currentTime
    }}>
      {children}
    </BrowserAudioContext.Provider>
  );
};
