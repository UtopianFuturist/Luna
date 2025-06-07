"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BskyAgent } from '@atproto/api';
import { parseSubject, SubjectType, isValidSubject, formatSubjectForDisplay } from './subjectResolver'; // Assuming subjectResolver.ts is at the root

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  agent: BskyAgent | null;
  emailLinkLogin: (identifier: string, password: string, authToken?: string) => Promise<{
    success: boolean;
    needsEmailToken: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Default to true
  const [agent, setAgent] = useState<BskyAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check for existing session
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true); // Ensure loading is true at the start of the process
      try {
        const storedSession = localStorage.getItem('blueshapes_session');
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);

          // Add detailed checks for essential session data properties
          if (
            sessionData &&
            typeof sessionData.did === 'string' && sessionData.did.trim() !== '' &&
            typeof sessionData.handle === 'string' && sessionData.handle.trim() !== '' &&
            typeof sessionData.accessJwt === 'string' && sessionData.accessJwt.trim() !== '' &&
            typeof sessionData.refreshJwt === 'string' && sessionData.refreshJwt.trim() !== ''
          ) {
            const newAgent = new BskyAgent({
              service: 'https://bsky.social',
            });

            await newAgent.resumeSession({
              did: sessionData.did,
              handle: sessionData.handle,
              accessJwt: sessionData.accessJwt,
              refreshJwt: sessionData.refreshJwt,
            });

            // Verify agent.session is populated after resume
            if (newAgent.session?.did) {
              setAgent(newAgent);
              setIsAuthenticated(true);
              setError(null);
              console.log('Successfully restored existing session for DID:', newAgent.session.did);
            } else {
              // resumeSession didn't populate agent.session as expected
              console.error('Failed to restore session: agent.session not populated after resumeSession.');
              localStorage.removeItem('blueshapes_session');
              setIsAuthenticated(false);
              setAgent(null);
              setError('Failed to restore session data. Please log in again.');
            }
          } else {
            // Essential data missing from stored session
            console.error('Failed to restore session: essential data missing from localStorage.', sessionData);
            localStorage.removeItem('blueshapes_session');
            setIsAuthenticated(false);
            setAgent(null);
            // setError('Invalid session data found. Please log in again.'); // Optional: set error for user
          }
        } else {
          // No stored session
          setIsAuthenticated(false);
          setAgent(null);
        }
      } catch (err) {
        console.error('Failed to restore session (exception):', err);
        localStorage.removeItem('blueshapes_session');
        setIsAuthenticated(false);
        setAgent(null);
        setError('Failed to restore session due to an error. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []); // Empty dependency array ensures this runs once on mount

  const emailLinkLogin = async (identifier: string, password: string, authToken?: string): Promise<{
    success: boolean;
    needsEmailToken: boolean;
    error?: string;
  }> => {
    alert("AuthContext DEBUG: emailLinkLogin entered.");
    alert("AuthContext DEBUG: Identifier received: [" + identifier + "]");
    alert("AuthContext DEBUG: Password received: [" + password + "]");

    // IMMEDIATELY return a dummy 2FA response for testing the flow
    return {
      success: false,
      needsEmailToken: true,
      error: "DEBUG: Forced 2FA step"
    };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('blueshapes_session');
      setAgent(null);
      setIsAuthenticated(false);
      console.log('Successfully signed out');
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        agent,
        emailLinkLogin,
        signOut,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
