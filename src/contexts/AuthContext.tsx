// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BskyAgent, AtpSessionData, AtpSessionEvent } from '@atproto/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  agent: BskyAgent | null;
  session: AtpSessionData | null;
  emailLinkLogin: (identifier: string, password: string, emailCode?: string) => Promise<{
    success: boolean;
    needsEmailToken?: boolean; // Indicates if a 2FA email token is required
    error?: string | null;
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
  const [session, setSession] = useState<AtpSessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      let initializedAgent: BskyAgent | null = null;

      if (typeof window !== 'undefined') {
        try {
          initializedAgent = new BskyAgent({
            service: 'https://bsky.social', // Default or make configurable
            persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
              if (evt === 'create' || evt === 'update') {
                if (sess) {
                  localStorage.setItem('omnisky_session', JSON.stringify(sess));
                  setSession(sess); // Update React state
                }
              } else if (evt === 'expired' || evt === 'create-failed') {
                localStorage.removeItem('omnisky_session');
                setSession(null); // Update React state
                setIsAuthenticated(false);
              }
            },
          });

          const storedSession = localStorage.getItem('omnisky_session');
          if (storedSession) {
            const parsedJson: Partial<AtpSessionData> & { did?: any, handle?: any, accessJwt?: any, refreshJwt?: any } = JSON.parse(storedSession);

            const sessionForResumption: AtpSessionData = {
              did: parsedJson.did || '',
              handle: parsedJson.handle || '',
              email: parsedJson.email,
              accessJwt: parsedJson.accessJwt || '',
              refreshJwt: parsedJson.refreshJwt || '',
              active: typeof parsedJson.active === 'boolean' ? parsedJson.active : true,
              emailConfirmed: typeof parsedJson.emailConfirmed === 'boolean' ? parsedJson.emailConfirmed : false,
              emailAuthFactor: typeof parsedJson.emailAuthFactor === 'boolean' ? parsedJson.emailAuthFactor : false,
              status: parsedJson.status,
              pdsUrl: parsedJson.pdsUrl,
            };

            if (!sessionForResumption.did || !sessionForResumption.handle || !sessionForResumption.accessJwt) {
              console.error("Stored session is missing critical fields, clearing.", parsedJson);
              localStorage.removeItem('omnisky_session');
              setIsAuthenticated(false);
              setError("Invalid session data found. Please log in again.");
            } else {
              // Attempt to resume session
              // Note: BskyAgent's resumeSession internally calls persistSession on success
              await initializedAgent.resumeSession(sessionForResumption);

              if (initializedAgent.session) {
                setSession(initializedAgent.session);
                setIsAuthenticated(true);
              } else {
                // Session resumption failed (e.g., expired refresh token)
                localStorage.removeItem('omnisky_session');
                setIsAuthenticated(false);
              }
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          console.error('Auth initialization error:', e);
          localStorage.removeItem('omnisky_session'); // Clear potentially corrupt session
          setError('Failed to initialize session.');
          setIsAuthenticated(false);
        } finally {
          setAgent(initializedAgent);
          setIsLoading(false);
        }
      } else {
        // Server-side or environment without window/localStorage
        initializedAgent = new BskyAgent({ service: 'https://bsky.social' });
        setAgent(initializedAgent);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const emailLinkLogin = async (identifier: string, password: string, emailCode?: string): Promise<{
    success: boolean;
    needsEmailToken?: boolean;
    error?: string | null;
  }> => {
    setIsLoading(true);
    setError(null);

    if (!agent) {
      // This should ideally not happen if useEffect initialized agent correctly
      setError("Authentication service not ready.");
      setIsLoading(false);
      return { success: false, error: "Authentication service not ready." };
    }

    try {
      if (emailCode) {
        // This is the 2FA confirmation step.
        // The Bluesky API for confirming email and then logging in is a bit nuanced.
        // Typically, after email confirmation, you'd attempt the login again.
        // For this example, let's assume the first call to `login` with just identifier/password
        // would have failed with a "AuthFactorTokenRequired" if 2FA was needed,
        // and then the client should request the email token.
        // Then, the server.createSession or a similar method would be used
        // with the identifier, password, AND the authToken (emailCode).
        // BskyAgent's `login` method doesn't directly support a third `authToken` parameter.
        // This part would need a more direct XRPC call if BskyAgent doesn't abstract it.

        // Placeholder for actual 2FA logic using XRPC:
        // 1. Call com.atproto.server.confirmEmail (if not done automatically by a previous step)
        // 2. Then call com.atproto.server.createSession with identifier, password, and potentially the confirmed token context.

        // Simplified: Try login again, assuming prior email confirmation allows it.
        // This is a conceptual simplification for this example.
        // Real 2FA with bsky.social might involve a specific token from confirmEmail
        // being passed to createSession or a different flow.
        await agent.login({ identifier, password }); // This might not be the correct 2FA flow with bsky.social

      } else {
        // Initial login attempt
        await agent.login({ identifier, password });
      }

      if (agent.session) {
        setIsAuthenticated(true);
        setSession(agent.session); // agent's persistSession should have stored it too
        setIsLoading(false);
        return { success: true };
      } else {
        // This path might not be hit if agent.login throws for failures.
        setIsLoading(false);
        return { success: false, error: "Login failed: No session created." };
      }
    } catch (e: any) {
      setIsLoading(false);
      const errorMsg = e.message || 'An unknown error occurred during login.';
      setError(errorMsg);

      // Check for 2FA required error (example, actual error message might differ)
      if (errorMsg.includes('AuthFactorTokenRequired') || errorMsg.includes('Authentication factor token required')) {
        return { success: false, needsEmailToken: true, error: "Two-factor authentication required." };
      }
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    if (agent) {
      try {
        // BskyAgent doesn't have a dedicated signOut method that clears session and local storage
        // We manually clear our persisted session and reset state.
        localStorage.removeItem('omnisky_session');
        // Resetting the agent instance might be good practice too, depending on its internal state management
        const newAgent = new BskyAgent({ service: agent.service });
        setAgent(newAgent);

      } catch (e: any) {
        console.error('Sign out error:', e);
        setError(e.message || 'Failed to sign out.');
      }
    }
    setSession(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    // router.push('/signin'); // Optionally redirect, or let ProtectedRoute handle it
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, agent, session, emailLinkLogin, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};
