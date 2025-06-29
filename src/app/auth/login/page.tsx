'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      await login(email, password);
      router.push('/dashboard');
        } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-delay">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center animate-pop-in">Login</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-green-800" required />
          <input name="password" type="password" placeholder="Password" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-green-800" required />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in">Login</button>
          {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        </form>
        <p className="mt-6 text-center text-green-800">Don't have an account? <a href="/auth/register" className="text-green-700 underline font-semibold">Register</a></p>
      </div>
    </div>
  );
}
