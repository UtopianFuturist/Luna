"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import WelcomeScreen from './WelcomeScreen';
import CredentialsScreen from './CredentialsScreen';
import TwoFactorScreen from './TwoFactorScreen';

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
  };

  const handleCredentialsNext = async (identifier: string, password: string) => {
    setIdentifier(identifier);
    setPassword(password);
    setError(null); // Clear previous SignInFlow error before new attempt

    try {
      const result = await emailLinkLogin(identifier, password);
      
      // More robust check for result and its properties
      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          router.push('/');
        } else if (result.needsEmailToken) {
          setCurrentStep(SignInStep.TWO_FACTOR);
        } else {
          // Handles cases like { success: false, error: '...' }
          console.log("SignInFlow: Login attempt failed:", result.error); // Log the specific error
          setError(result.error || 'Login failed. Please check your credentials.');
        }
      } else {
        // This case handles if result is undefined, null, or not the expected shape
        console.error("SignInFlow: emailLinkLogin returned invalid result structure:", result);
        setError('An unexpected error occurred. Login response was invalid.');
      }
    } catch (err) {
      // This catches errors thrown by emailLinkLogin OR if result was null/undefined and caused a TypeError
      console.error("SignInFlow: Critical error during handleCredentialsNext:", err);
      setError(err instanceof Error ? err.message : 'An critical unexpected error occurred during the login process.');
    }
  };

  const handleTwoFactorBack = () => {
    setCurrentStep(SignInStep.CREDENTIALS);
  };

  const handleTwoFactorNext = async (code: string) => {
    setError(null); // Clear previous SignInFlow error

    try {
      const result = await emailLinkLogin(identifier, password, code); // password should be available from state
      
      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          router.push('/');
        } else {
          console.log("SignInFlow: 2FA attempt failed:", result.error);
          setError(result.error || 'Invalid confirmation code. Please try again.');
        }
      } else {
        console.error("SignInFlow: emailLinkLogin (2FA) returned invalid result structure:", result);
        setError('An unexpected error occurred during 2FA. Response was invalid.');
      }
    } catch (err) {
      console.error("SignInFlow: Critical error during handleTwoFactorNext:", err);
      setError(err instanceof Error ? err.message : 'An critical unexpected error occurred during the 2FA process.');
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
        <CredentialsScreen 
          onBackClick={handleCredentialsBack}
          onNextClick={handleCredentialsNext}
        />
      );
    case SignInStep.TWO_FACTOR:
      return (
        <TwoFactorScreen 
          onBackClick={handleTwoFactorBack}
          onNextClick={handleTwoFactorNext}
          identifier={identifier}
        />
      );
    default:
      return null;
  }
};

export default SignInFlow;

