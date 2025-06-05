"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../AuthContext'; // Assuming AuthContext.tsx is at the root

export default function SignInPage() {
  const router = useRouter();
  const { emailLinkLogin, isLoading: authIsLoading, error: authError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [emailToken, setEmailToken] = useState('');

  const [needsEmailToken, setNeedsEmailToken] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsProcessing(true);

    if (!identifier.trim()) {
      setFormError("Username/handle cannot be empty.");
      setIsProcessing(false);
      return;
    }
    if (!password.trim()) {
      setFormError("Password cannot be empty.");
      setIsProcessing(false);
      return;
    }
    if (needsEmailToken && !emailToken.trim()) {
      setFormError("Email confirmation code cannot be empty.");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await emailLinkLogin(identifier, password, needsEmailToken ? emailToken : undefined);

      if (result.success) {
        router.push('/'); // Redirect to home/main app page after successful login
      } else if (result.needsEmailToken) {
        setNeedsEmailToken(true);
        setFormError(result.error || 'Please enter the confirmation code sent to your email.');
      } else {
        setFormError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Use authError if it's populated (e.g., from session restoration issues)
  React.useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const pageIsLoading = authIsLoading || isProcessing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px', color: '#333' }}>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="identifier" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Username or Handle</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="your.handle or did:plc:..."
              disabled={pageIsLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={pageIsLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          {needsEmailToken && (
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="emailToken" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Email Confirmation Code</label>
              <input
                type="text"
                id="emailToken"
                value={emailToken}
                onChange={(e) => setEmailToken(e.target.value)}
                placeholder="123456"
                disabled={pageIsLoading}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          )}
          {formError && (
            <p style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{formError}</p>
          )}
          <button
            type="submit"
            disabled={pageIsLoading}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: pageIsLoading ? '#ccc' : '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}
          >
            {pageIsLoading ? 'Processing...' : (needsEmailToken ? 'Confirm Code & Sign In' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
}
