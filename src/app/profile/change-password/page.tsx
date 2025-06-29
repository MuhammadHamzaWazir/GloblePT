import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email, oldPassword, newPassword }),
    });
    if (res.ok) {
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
    } else {
      setError('Password update failed.');
    }
  }

  if (!user) return <div className="p-8 text-red-600">Please log in to change your password.</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      {success && <div className="text-green-600 mb-2">Password updated!</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Old Password" className="input input-bordered w-full" required />
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="input input-bordered w-full" required />
        <button type="submit" className="btn btn-primary w-full">Update Password</button>
      </form>
    </div>
  );
}
