"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import CredentialsScreen from '@/components/CredentialsScreen';
import TwoFactorScreen from '@/components/TwoFactorScreen';

enum SignInStep {
  WELCOME = 'welcome',
  CREDENTIALS = 'credentials',
  TWO_FACTOR = 'two_factor',
}

const SignInFlow: React.FC = () => {
  const router = useRouter();
  const { emailLinkLogin } = useAuth();
  const [currentStep, setCurrentStep] = useState<SignInStep>(SignInStep.WELCOME);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignInClick = () => {
    setCurrentStep(SignInStep.CREDENTIALS);
  };

  const handleCreateAccountClick = () => {
    // This would navigate to a registration page
    // For now, just show the sign-in flow
    setCurrentStep(SignInStep.CREDENTIALS);
  };

  const handleCredentialsBack = () => {
    setCurrentStep(SignInStep.WELCOME);
    setError(null);
  };

  const handleCredentialsNext = async (identifier: string, password: string) => {
    // Store credentials for potential 2FA step
    setIdentifier(identifier);
    setPassword(password);
    setError(null);

    try {
      const result = await emailLinkLogin(identifier, password);
      
      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          // If login is successful, redirect to home page
          router.push('/');
        } else if (result.needsEmailToken) {
          // If 2FA is required, move to the TwoFactorScreen
          setCurrentStep(SignInStep.TWO_FACTOR);
        } else {
          // If login failed for other reasons, display the error
          console.log("SignInFlow: Login attempt failed:", result.error);
          setError(result.error || "Login failed. Please check your credentials.");
        }
      } else {
        console.error("SignInFlow: emailLinkLogin returned invalid result structure:", result);
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("SignInFlow: Critical error during handleCredentialsNext:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    }
  };

  const handleTwoFactorBack = () => {
    setCurrentStep(SignInStep.CREDENTIALS);
    setError(null);
  };

  const handleTwoFactorNext = async (code: string) => {
    setError(null);

    try {
      const result = await emailLinkLogin(identifier, password, code);
      
      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          // If 2FA verification is successful, redirect to home page
          router.push('/');
        } else {
          console.log("SignInFlow: 2FA attempt failed:", result.error);
          setError(result.error || 'Invalid confirmation code. Please try again.');
        }
      } else {
        console.error("SignInFlow: emailLinkLogin (2FA) returned invalid result structure:", result);
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      console.error("SignInFlow: Critical error during handleTwoFactorNext:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  // Render the appropriate step
  switch (currentStep) {
    case SignInStep.WELCOME:
      return (
        <WelcomeScreen 
          onSignInClick={handleSignInClick}
          onCreateAccountClick={handleCreateAccountClick}
        />
      );
    case SignInStep.CREDENTIALS:
      return (
        <div>
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <CredentialsScreen 
            onBackClick={handleCredentialsBack}
            onNextClick={handleCredentialsNext}
          />
        </div>
      );
    case SignInStep.TWO_FACTOR:
      return (
        <div>
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <TwoFactorScreen 
            onBackClick={handleTwoFactorBack}
            onNextClick={handleTwoFactorNext}
            identifier={identifier}
          />
        </div>
      );
    default:
      return null;
  }
};

export default SignInFlow;

