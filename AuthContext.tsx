"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BskyAgent } from '@atproto/api';
import { parseSubject, SubjectType, isValidSubject, formatSubjectForDisplay } from '@/lib/subjectResolver';

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
      setIsLoading(true);
      try {
        const storedSession = localStorage.getItem('omnisky_session');
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);

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

            try {
              await newAgent.resumeSession({
                did: sessionData.did,
                handle: sessionData.handle,
                accessJwt: sessionData.accessJwt,
                refreshJwt: sessionData.refreshJwt,
              });

              if (newAgent.session?.did) {
                setAgent(newAgent);
                setIsAuthenticated(true);
                setError(null);
                console.log('Successfully restored existing session for DID:', newAgent.session.did);
              } else {
                console.error('Failed to restore session: agent.session not populated after resumeSession.');
                localStorage.removeItem('omnisky_session');
                setIsAuthenticated(false);
                setAgent(null);
              }
            } catch (resumeError) {
              console.error('Failed to resume session:', resumeError);
              localStorage.removeItem('omnisky_session');
              setIsAuthenticated(false);
              setAgent(null);
            }
          } else {
            console.error('Invalid session data found in localStorage.');
            localStorage.removeItem('omnisky_session');
            setIsAuthenticated(false);
            setAgent(null);
          }
        } else {
          setIsAuthenticated(false);
          setAgent(null);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('omnisky_session');
        setIsAuthenticated(false);
        setAgent(null);
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
    setIsLoading(true);
    
    try {
      const newAgent = new BskyAgent({
        service: 'https://bsky.social',
      });

      if (authToken) {
        // This is the 2FA confirmation step
        try {
          // For BlueSky, we typically need to use the login endpoint with the 2FA token
          // The exact implementation may vary based on BlueSky's API
          const loginRes = await newAgent.login({
            identifier,
            password,
            authFactorToken: authToken, // This may be the correct parameter name
          });
          
          if (loginRes.success && newAgent.session) {
            localStorage.setItem('omnisky_session', JSON.stringify(newAgent.session));
            setAgent(newAgent);
            setIsAuthenticated(true);
            return { success: true, needsEmailToken: false };
          } else {
            return { 
              success: false, 
              needsEmailToken: false, 
              error: 'Invalid confirmation code. Please try again.' 
            };
          }
        } catch (err: any) {
          console.error('2FA confirmation error:', err);
          return { 
            success: false, 
            needsEmailToken: false, 
            error: err.message || 'Failed to verify confirmation code.' 
          };
        }
      } else {
        // Initial login attempt
        try {
          const loginRes = await newAgent.login({
            identifier,
            password,
          });
          
          if (loginRes.success && newAgent.session) {
            localStorage.setItem('omnisky_session', JSON.stringify(newAgent.session));
            setAgent(newAgent);
            setIsAuthenticated(true);
            return { success: true, needsEmailToken: false };
          } else {
            // Check if the error indicates 2FA is required
            const errorMessage = loginRes.error || 'Login failed';
            if (errorMessage.toLowerCase().includes('token') || 
                errorMessage.toLowerCase().includes('verification') ||
                errorMessage.toLowerCase().includes('confirm')) {
              return { success: false, needsEmailToken: true, error: errorMessage };
            } else {
              setError(errorMessage);
              return { success: false, needsEmailToken: false, error: errorMessage };
            }
          }
        } catch (err: any) {
          console.error('Login error:', err);
          
          // Check if the error message indicates 2FA is required
          const errorMessage = err.message || 'An unexpected error occurred during login.';
          if (errorMessage.toLowerCase().includes('token') || 
              errorMessage.toLowerCase().includes('verification') ||
              errorMessage.toLowerCase().includes('confirm')) {
            return { success: false, needsEmailToken: true, error: errorMessage };
          } else {
            setError(errorMessage);
            return { 
              success: false, 
              needsEmailToken: false, 
              error: errorMessage 
            };
          }
        }
      }
    } catch (err: any) {
      console.error('AuthContext: Critical login error:', err);
      const errorMessage = err.message || 'A critical error occurred during the login process.';
      setError(errorMessage);
      return { 
        success: false, 
        needsEmailToken: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('omnisky_session');
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

