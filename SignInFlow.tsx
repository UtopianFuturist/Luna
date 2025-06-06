"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../AuthContext';
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
    
    try {
      const result = await emailLinkLogin(identifier, password);
      
      if (result.success) {
        // Login successful, redirect to home
        router.push('/');
      } else if (result.needsEmailToken) {
        // 2FA required
        setCurrentStep(SignInStep.TWO_FACTOR);
      } else {
        // Login failed
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handleTwoFactorBack = () => {
    setCurrentStep(SignInStep.CREDENTIALS);
  };

  const handleTwoFactorNext = async (code: string) => {
    try {
      const result = await emailLinkLogin(identifier, password, code);
      
      if (result.success) {
        // Login successful, redirect to home
        router.push('/');
      } else {
        // Login failed
        setError(result.error || 'Invalid confirmation code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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

