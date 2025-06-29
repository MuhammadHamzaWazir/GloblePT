import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      setError('No user found with that email.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      {success && <div className="text-green-600 mb-2">If your email exists, you will receive a reset link or instructions.</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <input name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="input input-bordered w-full" required />
        <button type="submit" className="btn btn-primary w-full">Send Reset Link</button>
      </form>
    </div>
  );
}
