import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';

interface Prescription {
  id: string;
  description: string;
  user: { name: string; email: string };
  status: string;
  paymentStatus: string;
  deliveryAddress?: string;
  createdAt: string;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/prescriptions?staffId=${user.id}`)
        .then(res => res.json())
        .then(setPrescriptions);
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Prescriptions</h1>
      <table className="table w-full">
        <thead>
          <tr><th>Description</th><th>User</th><th>Status</th><th>Payment</th><th>Delivery</th><th>Date</th></tr>
        </thead>
        <tbody>
          {prescriptions.map(rx => (
            <tr key={rx.id}>
              <td>{rx.description}</td>
              <td>{rx.user?.name} ({rx.user?.email})</td>
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
