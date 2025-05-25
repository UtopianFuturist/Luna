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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        session,
        signIn,
        signOut,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
