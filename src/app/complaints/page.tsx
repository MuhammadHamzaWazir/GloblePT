import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('userId', user.id);
    formData.append('message', message);
    if (file) formData.append('file', file);
    await fetch('/api/complaints', { method: 'POST', body: formData });
    setSubmitted(true);
    setMessage('');
    setFile(null);
  }

  if (!user) {
    return <div className="p-8 text-red-600">Please log in to submit a complaint.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complaints Form</h1>
      {submitted && <div className="text-green-600 mb-4">Complaint submitted!</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input value={user.name} disabled className="input input-bordered w-full" />
        <input value={user.email} disabled className="input input-bordered w-full" />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your complaint" className="textarea textarea-bordered w-full" rows={5} required />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="file-input file-input-bordered w-full" />
        <button type="submit" className="btn btn-primary w-full">Submit</button>
      </form>
    </div>
  );
}
