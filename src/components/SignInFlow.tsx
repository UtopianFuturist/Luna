// src/components/SignInFlow.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Path alias
import WelcomeScreen from './WelcomeScreen';
import CredentialsScreen from './CredentialsScreen';
import TwoFactorScreen from './TwoFactorScreen';

type SignInStep = 'welcome' | 'credentials' | '2fa';

const SignInFlow: React.FC = () => {
  const [step, setStep] = useState<SignInStep>('welcome');
  const [identifier, setIdentifier] = useState(''); // Store identifier for 2FA screen
  const [password, setPassword] = useState(''); // Store password for 2FA screen

  const { emailLinkLogin, isLoading: authIsLoading, error: authError } = useAuth();
  const router = useRouter();

  const handleWelcomeSignIn = () => {
    setStep('credentials');
  };

  const handleWelcomeCreateAccount = () => {
    // Redirect to a sign-up page or handle account creation flow
    // For now, let's just log it and stay on welcome, or also go to credentials for demo
    console.log('Create account clicked');
    // setStep('credentials'); // Or navigate to a dedicated sign-up flow
    alert("Create account functionality not implemented in this demo.");
  };

  const handleCredentialsNext = async (id: string, pass: string) => {
    setIdentifier(id); // Save for potential 2FA step
    setPassword(pass); // Save for potential 2FA step

    const result = await emailLinkLogin(id, pass);
    if (result.success) {
      router.push('/'); // Navigate to dashboard or home on successful login
    } else if (result.needsEmailToken) {
      setStep('2fa');
    }
    // If there's an error, it will be handled by authError from useAuth context
  };

  const handleTwoFactorNext = async (code: string) => {
    // Use the stored identifier and password for the 2FA attempt
    const result = await emailLinkLogin(identifier, password, code);
    if (result.success) {
      router.push('/'); // Navigate to dashboard or home
    }
    // Error is handled by authError from useAuth
  };

  const handleBack = () => {
    if (step === '2fa') {
      setStep('credentials');
    } else if (step === 'credentials') {
      setStep('welcome');
    }
  };

  const renderStep = () => {
    // Temporarily bypass switch logic to isolate potential errors
    return <div>SignInFlow Test Output</div>;

    // switch (step) {
    //   case 'welcome':
    //     return (
    //       <WelcomeScreen
    //         onSignInClick={handleWelcomeSignIn}
    //         onCreateAccountClick={handleWelcomeCreateAccount}
    //       />
    //     );
    //   case 'credentials':
    //     return (
    //       <CredentialsScreen
    //         onBackClick={handleBack}
    //         onNextClick={handleCredentialsNext}
    //         isLoading={authIsLoading}
    //         error={authError}
    //       />
    //     );
    //   case '2fa':
    //     return (
    //       <TwoFactorScreen
    //         onBackClick={handleBack}
    //         onNextClick={handleTwoFactorNext}
    //         identifier={identifier} // Pass the identifier to display
    //         isLoading={authIsLoading}
    //         error={authError}
    //       />
    //     );
    //   default:
    //     return <WelcomeScreen onSignInClick={handleWelcomeSignIn} onCreateAccountClick={handleWelcomeCreateAccount} />;
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      {renderStep()}
    </div>
  );
};

export default SignInFlow;
