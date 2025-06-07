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
    setIsLoading(true);
    setError(null);

    try {
      /*
      if (!isValidSubject(identifier)) {
        throw new Error('Invalid BlueSky handle or DID format');
      }
      */

      const newAgent = new BskyAgent({
        service: 'https://bsky.social',
      });

      try {
        alert("AuthContext: Identifier being sent: [" + identifier + "]");
        alert("AuthContext: Password being sent: [" + password + "]");
        const result = await newAgent.login({
          identifier,
          password,
          ...(authToken ? { authFactorToken: authToken } : {}),
        });

        // Ensure all necessary data is present before storing
        if (result.data.did && result.data.handle && result.data.accessJwt && result.data.refreshJwt) {
            localStorage.setItem('blueshapes_session', JSON.stringify({
            did: result.data.did,
            handle: result.data.handle,
            accessJwt: result.data.accessJwt,
            refreshJwt: result.data.refreshJwt,
            }));
            setAgent(newAgent); // agent.session should be populated by BskyAgent after login
            setIsAuthenticated(true);
            console.log('Successfully logged in');
            setIsLoading(false);
            return {
                success: true,
                needsEmailToken: false
            };
        } else {
            // Login succeeded but response data is incomplete
            console.error('Login error: Incomplete session data from server.', result.data);
            setError('Login succeeded but received incomplete session data.');
            setIsLoading(false);
            return {
                success: false,
                needsEmailToken: false,
                error: 'Login succeeded but received incomplete session data.'
            };
        }
      } catch (err: any) {
        console.error('Detailed error from agent.login:', JSON.stringify(err, null, 2));
        console.log('Login error from agent.login:', err);
        if (
          err.error === 'AuthFactorTokenRequired' || // Exact error code
          (err.message && err.message.toLowerCase().includes('authentication factor required')) || // More general message check
          (err.message && err.message.toLowerCase().includes('2fa required')) || // Another common message
          (err.name && err.name.toLowerCase().includes('authfactor')) // Check error name if available
        ) {
          setIsLoading(false);
          return {
            success: false,
            needsEmailToken: true,
            error: 'A confirmation code has been sent to your email. Please enter it to continue.'
          };
        }
        throw err;
      }
    } catch (err: any) {
      alert("AuthContext: Outer catch block entered. Error: " + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      console.error('Failed to login (outer catch):', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate';
      setError(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        needsEmailToken: false,
        error: errorMessage
      };
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
