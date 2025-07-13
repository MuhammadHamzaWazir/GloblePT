'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDashboardRoute } from '../../../lib/utils';
import TwoFactorModal from '../../components/TwoFactorModal';
import AuthGuard from '@/components/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginPageContent />
    </AuthGuard>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    // Check for registration success message
    if (searchParams?.get('registered') === 'true') {
      const message = searchParams.get('message');
      if (message) {
        setSuccessMessage(decodeURIComponent(message));
      } else {
        setSuccessMessage('Registration successful! Please wait for admin approval before logging in.');
      }
    }

    const checkAuthAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role) {
            console.log('User already authenticated, redirecting...', data.user);
            const dashboardRoute = getDashboardRoute(data.user.role);
            window.location.replace(dashboardRoute);
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      }
    };

    // Check auth status when component mounts
    checkAuthAndRedirect();
  }, [searchParams]);

  // Also check auth status when 2FA modal closes successfully
  useEffect(() => {
    if (!showTwoFactor && userEmail) {
      setTimeout(() => {
        const checkAuthAndRedirect = async () => {
          try {
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.user && data.user.role) {
                console.log('User authenticated after 2FA, redirecting...', data.user);
                const dashboardRoute = getDashboardRoute(data.user.role);
                window.location.replace(dashboardRoute);
              }
            }
          } catch (error) {
            console.log('Post-2FA auth check failed:', error);
          }
        };
        
        checkAuthAndRedirect();
      }, 200);
    }
  }, [showTwoFactor, userEmail]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    try {
      // First, verify credentials
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        throw new Error(data.message || 'Login failed');
      }

      const loginData = await loginResponse.json();
      
      // Check if 2FA is required
      if (loginData.requiresVerification) {
        // If 2FA is enabled, send verification code
        const verificationResponse = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (verificationResponse.ok) {
          setUserEmail(email);
          setShowTwoFactor(true);
          setLoading(false);
        } else {
          throw new Error('Failed to send verification code');
        }
      } else {
        // If 2FA is disabled, login was successful and cookie is already set
        const redirectUrl = loginData.redirectUrl || getDashboardRoute(loginData.user?.role || 'customer');
        
        console.log(`Redirecting ${loginData.user?.role} to ${redirectUrl}`);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  }

  async function handleVerifyCode(code: string) {
    setVerifyingCode(true);
    setTwoFactorError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      console.log('2FA verification successful for user:', data.user);
      
      // Close the modal immediately
      setShowTwoFactor(false);
      setTwoFactorError('');
      setUserEmail('');
      
      // Get user role for redirection
      const userRole = data.user?.role;
      console.log('User role:', userRole);
      
      // Add a small delay to ensure cookie is set properly, then redirect
      setTimeout(() => {
        const redirectUrl = data.redirectUrl || getDashboardRoute(data.user?.role || 'customer');
        console.log(`Force redirecting to: ${redirectUrl}`);
        
        // Use replace instead of href to prevent back button issues
        window.location.replace(redirectUrl);
      }, 500); // 500ms delay to ensure cookie propagation
      
    } catch (err: any) {
      setTwoFactorError(err.message || 'Verification failed');
    } finally {
      setVerifyingCode(false);
    }
  }

  function handleCloseTwoFactor() {
    setShowTwoFactor(false);
    setUserEmail('');
    setTwoFactorError('');
    setLoading(false);
  }
  
  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-delay">
          <h1 className="text-3xl font-bold text-green-800 mb-6 text-center animate-pop-in">Login</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-green-800" 
              required 
              disabled={loading}
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-green-800" 
              required 
              disabled={loading}
            />
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending verification code...
                </>
              ) : (
                'Login'
              )}
            </button>
            {successMessage && (
              <div className="text-green-600 mt-2 text-center bg-green-50 p-3 rounded-md border border-green-200">
                {successMessage}
              </div>
            )}
            {error && <div className="text-red-600 mt-2 text-center bg-red-50 p-3 rounded-md">{error}</div>}
          </form>
          <p className="mt-6 text-center text-green-800">Don't have an account? <a href="/auth/register" className="text-green-700 underline font-semibold">Register</a></p>
        </div>
      </div>

      <TwoFactorModal
        isOpen={showTwoFactor}
        onClose={handleCloseTwoFactor}
        onVerify={handleVerifyCode}
        userEmail={userEmail}
        loading={verifyingCode}
        error={twoFactorError}
      />
    </>
  );
}
