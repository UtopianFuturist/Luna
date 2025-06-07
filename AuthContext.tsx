// Fixed version of AuthContext.tsx

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
    setError(null);
    setIsLoading(true);
    
    try {
      const newAgent = new BskyAgent({
        service: 'https://bsky.social',
      });

      // For BlueSky, we need to check if this is a 2FA flow or initial login
      if (authToken) {
        // This is the 2FA confirmation step
        // Note: This is a simplified example. The actual implementation will depend on 
        // how BlueSky handles 2FA. You may need to use a different API endpoint.
        try {
          // This is a placeholder. Replace with actual BlueSky 2FA confirmation API
          const confirmResult = await fetch('https://bsky.social/xrpc/com.atproto.server.confirmEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: identifier,
              token: authToken,
            }),
          });
          
          const confirmData = await confirmResult.json();
          
          if (confirmResult.ok) {
            // Now try to login again with the confirmed credentials
            const loginRes = await newAgent.login({
              identifier,
              password,
            });
            
            if (loginRes.success) {
              localStorage.setItem('blueshapes_session', JSON.stringify(newAgent.session));
              setAgent(newAgent);
              setIsAuthenticated(true);
              return { success: true, needsEmailToken: false };
            } else {
              return { 
                success: false, 
                needsEmailToken: false, 
                error: loginRes.error || 'Login failed after 2FA confirmation.' 
              };
            }
          } else {
            return { 
              success: false, 
              needsEmailToken: false, 
              error: confirmData.error || 'Failed to confirm 2FA code.' 
            };
          }
        } catch (err: any) {
          console.error('2FA confirmation error:', err);
          return { 
            success: false, 
            needsEmailToken: false, 
            error: err.message || 'An error occurred during 2FA confirmation.' 
          };
        }
      } else {
        // Initial login attempt
        try {
          const loginRes = await newAgent.login({
            identifier,
            password,
          });
          
          if (loginRes.success) {
            localStorage.setItem('blueshapes_session', JSON.stringify(newAgent.session));
            setAgent(newAgent);
            setIsAuthenticated(true);
            return { success: true, needsEmailToken: false };
          } else {
            // Check if the error indicates 2FA is required
            // Note: You'll need to check the actual error message/code that BlueSky returns
            if (loginRes.error && 
                (loginRes.error.includes('2fa') || 
                 loginRes.error.includes('two-factor') || 
                 loginRes.error.includes('verification'))) {
              return { success: false, needsEmailToken: true, error: loginRes.error };
            } else {
              setError(loginRes.error || 'Login failed. Please check your credentials.');
              return { success: false, needsEmailToken: false, error: loginRes.error };
            }
          }
        } catch (err: any) {
          console.error('Login error:', err);
          
          // Check if the error message indicates 2FA is required
          if (err.message && 
              (err.message.includes('2fa') || 
               err.message.includes('two-factor') || 
               err.message.includes('verification'))) {
            return { success: false, needsEmailToken: true, error: err.message };
          } else {
            setError(err.message || 'An unexpected error occurred during login.');
            return { 
              success: false, 
              needsEmailToken: false, 
              error: err.message || 'An unexpected error occurred during login.' 
            };
          }
        }
      }
    } catch (err: any) {
      console.error('AuthContext: Critical login error:', err);
      setError(err.message || 'A critical error occurred during the login process.');
      return { 
        success: false, 
        needsEmailToken: false, 
        error: err.message || 'A critical error occurred during the login process.' 
      };
    } finally {
      setIsLoading(false);
    }
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

