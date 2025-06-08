"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BskyAgent } from '@atproto/api'; // Added BskyAgent import
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
  session: OAuthSession | null; // For OAuth flow
  agent: BskyAgent | null; // For direct BskyAgent login
  signIn: (handle: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  emailLinkLogin: (identifier: string, password: string, emailCode?: string) => Promise<{ success: boolean; needsEmailToken?: boolean; error?: string | null }>;
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
  const [session, setSession] = useState<OAuthSession | null>(null); // For OAuth
  const [agent, setAgent] = useState<BskyAgent | null>(null); // For BskyAgent
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

  const emailLinkLogin = async (identifier: string, password: string, emailCode?: string) => {
    console.log('emailLinkLogin called with:', { identifier, hasPassword: !!password, hasEmailCode: !!emailCode });
    setIsLoading(true); // Ensure isLoading is set at the beginning
    setError(null); // Clear previous errors

    const newAgent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (evt, sessionData) => {
        // This callback can be used for more integrated session persistence if needed.
        // For now, emailLinkLogin manually handles localStorage.
        // console.log('BskyAgent session event:', evt, sessionData);
      },
    });

    try {
      // Step 1: Initial login attempt or 2FA verification
      if (!emailCode) {
        // Initial login attempt
        const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: identifier,
            password: password,
          }),
        });

        const data = await response.json();
        console.log('Initial login response:', { status: response.status, data });

        if (!response.ok) {
          // Check if it's a 2FA required error
          if (response.status === 401 && data.error === 'AuthFactorTokenRequired') {
            console.log('2FA required, sending email token request');

            // Request 2FA token via email
            const emailResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.requestEmailUpdate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                identifier: identifier, // Corrected: Use identifier for requesting email update
              }),
            });

            if (emailResponse.ok) {
              return {
                success: false,
                needsEmailToken: true,
                error: null
              };
            } else {
              const emailError = await emailResponse.json();
              return {
                success: false,
                error: emailError.message || 'Failed to send verification email'
              };
            }
          }

          // Other login errors
          return {
            success: false,
            error: data.message || data.error || 'Invalid credentials'
          };
        }

        // Direct login success (no 2FA required)
        if (data.accessJwt && data.refreshJwt) {
          // Store authentication data
          localStorage.setItem('accessToken', data.accessJwt);
          localStorage.setItem('refreshToken', data.refreshJwt);
          localStorage.setItem('userHandle', data.handle);
          localStorage.setItem('userDid', data.did);

          // Update auth context state
          await newAgent.resumeSession({
            did: data.did,
            handle: data.handle,
            accessJwt: data.accessJwt,
            refreshJwt: data.refreshJwt,
            email: data.email, // Optional: BskyAgent handles undefined email
          });
          setAgent(newAgent);
          setIsAuthenticated(true);
          setError(null);

          console.log('Direct login successful, agent session resumed and set in context');
          return {
            success: true,
            error: null
          };
        }

        return {
          success: false,
          error: 'Invalid response from server'
        };

      } else {
        // Step 2: 2FA verification with email code
        console.log('Attempting 2FA verification');

        const verifyResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.confirmEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: identifier, // Corrected: Use identifier (email) for confirming email
            token: emailCode,
          }),
        });

        if (!verifyResponse.ok) {
          const verifyError = await verifyResponse.json();
          return {
            success: false,
            error: verifyError.message || 'Invalid confirmation code'
          };
        }

        // After email confirmation, try login again
        const finalLoginResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: identifier,
            password: password,
          }),
        });

        const finalData = await finalLoginResponse.json();
        console.log('Final login after 2FA:', { status: finalLoginResponse.status, data: finalData });

        if (!finalLoginResponse.ok) {
          return {
            success: false,
            error: finalData.message || finalData.error || 'Login failed after verification'
          };
        }

        if (finalData.accessJwt && finalData.refreshJwt) {
          // Store authentication data
          localStorage.setItem('accessToken', finalData.accessJwt);
          localStorage.setItem('refreshToken', finalData.refreshJwt);
          localStorage.setItem('userHandle', finalData.handle);
          localStorage.setItem('userDid', finalData.did);

          // Update auth context state
          await newAgent.resumeSession({
            did: finalData.did,
            handle: finalData.handle,
            accessJwt: finalData.accessJwt,
            refreshJwt: finalData.refreshJwt,
            email: finalData.email, // Optional: BskyAgent handles undefined email
          });
          setAgent(newAgent);
          setIsAuthenticated(true);
          setError(null);

          console.log('2FA login successful, agent session resumed and set in context');
          return {
            success: true,
            error: null
          };
        }

        return {
          success: false,
          error: 'Invalid response from server after verification'
        };
      }
    } catch (error) {
      console.error('emailLinkLogin network error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false); // Ensure isLoading is reset in all cases
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        session, // OAuth session
        agent,   // BskyAgent instance
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
