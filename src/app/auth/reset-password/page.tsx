import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      setError('Invalid or expired token.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      {success && <div className="text-green-600 mb-2">Password updated! You can now log in.</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <input name="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New Password" className="input input-bordered w-full" required />
        <button type="submit" className="btn btn-primary w-full">Set New Password</button>
      </form>
    </div>
  );
}
