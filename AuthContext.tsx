"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BskyAgent } from '@atproto/api';
import { parseSubject, SubjectType, isValidSubject, formatSubjectForDisplay } from './subjectResolver';

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
  const [isLoading, setIsLoading] = useState(true);
  const [agent, setAgent] = useState<BskyAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check for existing session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we have a stored session
        const storedSession = localStorage.getItem('blueshapes_session');
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          
          // Create a new agent
          const newAgent = new BskyAgent({
            service: 'https://bsky.social',
          });
          
          // Resume the session
          await newAgent.resumeSession({
            did: sessionData.did,
            handle: sessionData.handle,
            accessJwt: sessionData.accessJwt,
            refreshJwt: sessionData.refreshJwt,
          });
          
          setAgent(newAgent);
          setIsAuthenticated(true);
          console.log('Successfully restored existing session');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Clear any invalid session data
        localStorage.removeItem('blueshapes_session');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const emailLinkLogin = async (identifier: string, password: string, authToken?: string): Promise<{
    success: boolean;
    needsEmailToken: boolean;
    error?: string;
  }> => {
    setError(null);

    try {
      // Validate the identifier (handle or DID)
      if (!isValidSubject(identifier)) {
        throw new Error('Invalid BlueSky handle or DID format');
      }

      console.log(`Attempting login for ${identifier}${authToken ? ' with auth token' : ''}`);

      // Create a new agent
      const newAgent = new BskyAgent({
        service: 'https://bsky.social',
      });

      try {
        // Login with the provided credentials
        const result = await newAgent.login({
          identifier,
          password,
          ...(authToken ? { authFactorToken: authToken } : {}),
        });

        // Store the session data
        localStorage.setItem('blueshapes_session', JSON.stringify({
          did: result.data.did,
          handle: result.data.handle,
          accessJwt: result.data.accessJwt,
          refreshJwt: result.data.refreshJwt,
        }));

        setAgent(newAgent);
        setIsAuthenticated(true);
        console.log('Successfully logged in');
        
        return {
          success: true,
          needsEmailToken: false
        };
      } catch (err: any) {
        console.log('Login error:', err);
        
        // Check if this is an auth factor token required error
        // This is the critical part that needs to be fixed
        if (
          err.error === 'AuthFactorTokenRequired' || 
          (err.message && err.message.includes('auth factor token')) ||
          (err.status === 401 && err.error === 'InvalidToken') ||
          (err.status === 401 && err.message && err.message.includes('token'))
        ) {
          console.log('Email auth token required - 2FA needed');
          return {
            success: false,
            needsEmailToken: true,
            error: 'A confirmation code has been sent to your email. Please enter it to continue.'
          };
        }
        
        // Handle other errors
        throw err;
      }
    } catch (err: any) {
      console.error('Failed to login:', err);
      
      // Additional check for 2FA errors that might be missed
      if (
        err.error === 'AuthFactorTokenRequired' || 
        (err.message && err.message.includes('auth factor token')) ||
        (err.status === 401 && err.error === 'InvalidToken') ||
        (err.status === 401 && err.message && err.message.includes('token'))
      ) {
        console.log('Caught 2FA requirement in catch block');
        return {
          success: false,
          needsEmailToken: true,
          error: 'A confirmation code has been sent to your email. Please enter it to continue.'
        };
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate';
      setError(errorMessage);
      
      return {
        success: false,
        needsEmailToken: false,
        error: errorMessage
      };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      // Clear the stored session
      localStorage.removeItem('blueshapes_session');
      
      // Reset the agent
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
