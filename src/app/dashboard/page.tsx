'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';

interface Prescription {
  id: string;
  description: string;
  imageUrl?: string;
  status: string;
  paymentStatus: string;
  deliveryAddress?: string;
  createdAt: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/prescriptions?userId=${user.id}`)
        .then(res => res.json())
        .then(setPrescriptions);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, description: desc, imageUrl, deliveryAddress: address }),
    });
    const newRx = await res.json();
    setPrescriptions([newRx, ...prescriptions]);
    setDesc(''); setAddress(''); setImageUrl('');
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Prescriptions</h1>
      <form className="space-y-2 mb-6" onSubmit={handleSubmit}>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Prescription details" className="textarea textarea-bordered w-full" required />
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery Address" className="input input-bordered w-full" required />
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="input input-bordered w-full" />
        <button type="submit" className="btn btn-primary w-full">Send Prescription</button>
      </form>
      <table className="table w-full">
        <thead>
          <tr><th>Description</th><th>Status</th><th>Payment</th><th>Delivery</th><th>Date</th></tr>
        </thead>
        <tbody>
          {prescriptions.map(rx => (
            <tr key={rx.id}>
              <td>{rx.description}</td>
              <td>{rx.status}</td>
              <td>{rx.paymentStatus}</td>
              <td>{rx.deliveryAddress}</td>
              <td>{new Date(rx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
