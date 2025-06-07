"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserOAuthClient, OAuthSession } from '@atproto/oauth-client-browser';

// Add type extension for BrowserOAuthClient session property
declare module '@atproto/oauth-client-browser' {
  interface BrowserOAuthClient {
    session?: OAuthSession;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: OAuthSession | null;
  signIn: (handle: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  emailLinkLogin: (identifier: string, password?: string, token?: string) => Promise<{ success: boolean; needsEmailToken?: boolean; error?: string }>;
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
  const [session, setSession] = useState<OAuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<BrowserOAuthClient | null>(null);

  // Initialize the OAuth client
  useEffect(() => {
    const initClient = async () => {
      try {
        // Create the OAuth client
        const oauthClient = new BrowserOAuthClient({
          clientMetadata: {
            client_id: "https://rwghgydn.manus.space/client-metadata.json",
            client_name: "BlueShapes",
            client_uri: "https://rwghgydn.manus.space",
            logo_uri: "https://rwghgydn.manus.space/shapes_logo.jpeg",
            redirect_uris: ["https://rwghgydn.manus.space/callback"],
            scope: "atproto",
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
            token_endpoint_auth_method: "none",
            application_type: "web",
            dpop_bound_access_tokens: true
          },
          handleResolver: 'https://bsky.social',
          responseMode: 'fragment'
        });

        setClient(oauthClient);

        // Initialize the client and check for existing sessions
        const result = await oauthClient.init();
        
        if (result) {
          const { session: existingSession } = result;
          setSession(existingSession);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to initialize OAuth client:', err);
        setError('Failed to initialize authentication. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initClient();
  }, []);

  const signIn = async (handle: string) => {
    if (!client) {
      setError('Authentication system not initialized. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Start the OAuth flow with the provided handle
      await client.authorize(handle);
      
      // The above function will redirect the user to the OAuth server
      // The page will reload after the redirect back to our app
      // The init() function in useEffect will handle the redirect response
    } catch (err) {
      console.error('Failed to start auth flow:', err);
      setError('Failed to authenticate. Please check your handle and try again.');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!client) {
      setError('Authentication system not initialized. Please try again later.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Clear the session using the proper API
      client.session = undefined;
      setSession(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const emailLinkLogin = async (identifier: string, password?: string, token?: string): Promise<{ success: boolean; needsEmailToken?: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate a real login flow
    if (password && !token) { // Initial login attempt
      if (identifier === 'user@example.com' && password === 'password123') {
        // Simulate 2FA requirement for a specific user
        console.log('AuthContext: emailLinkLogin - 2FA required for', identifier);
        setIsLoading(false);
        return { success: false, needsEmailToken: true };
        // Simulate direct success for other dummy users (not implemented here)
      } else if (identifier === 'test@example.com' && password === 'testpass') {
          console.log('AuthContext: emailLinkLogin successful (no 2FA) for', identifier);
          setSession({ /* some dummy session data */ id: 'dummy-session', handle: identifier, did: 'did:example:123', email: identifier } as OAuthSession); // Added type assertion
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
      }
      console.log('AuthContext: emailLinkLogin failed for', identifier);
      setIsLoading(false);
      setError('Invalid credentials.');
      return { success: false, error: 'Invalid credentials.' };
    } else if (password && token) { // 2FA token submission
      if (identifier === 'user@example.com' && token === '123456') {
        console.log('AuthContext: emailLinkLogin successful (with 2FA) for', identifier);
        setSession({ /* some dummy session data */ id: 'dummy-session-2fa', handle: identifier, did: 'did:example:456', email: identifier } as OAuthSession); // Added type assertion
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      } else {
        console.log('AuthContext: emailLinkLogin failed (invalid 2FA token) for', identifier);
        setIsLoading(false);
        setError('Invalid 2FA token.');
        return { success: false, error: 'Invalid 2FA token.' };
      }
    }

    setIsLoading(false);
    setError('Invalid login attempt.');
    return { success: false, error: 'Invalid login attempt. Password is required.' };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        session,
        signIn,
        signOut,
        error,
        emailLinkLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
