'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { getDashboardRoute } from '../../../lib/utils';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    try {
      await login(email, password);
      
      // Get user role from auth verification endpoint
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const userRole = data.user?.role;
        
        if (userRole) {
          const dashboardRoute = getDashboardRoute(userRole);
          console.log(`Redirecting ${userRole} to ${dashboardRoute}`);
          router.push(dashboardRoute);
        } else {
          // Fallback to customer dashboard if role is not found
          router.push('/dashboard');
        }
      } else {
        // Fallback to customer dashboard if verification fails
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }
  
  return (
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
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
          {error && <div className="text-red-600 mt-2 text-center bg-red-50 p-3 rounded-md">{error}</div>}
        </form>
        <p className="mt-6 text-center text-green-800">Don't have an account? <a href="/auth/register" className="text-green-700 underline font-semibold">Register</a></p>
      </div>
    </div>
  );
}
