'use client';

import React, { useEffect, useState } from 'react';

interface Prescription {
  id: string;
  description: string;
  user: { name: string; email: string };
  staff?: { id: string; name: string };
  status: string;
  paymentStatus: string;
  deliveryAddress?: string;
  createdAt: string;
}
interface Staff {
  id: string;
  name: string;
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/prescriptions').then(res => res.json()),
      fetch('/api/staff').then(res => res.json()),
    ]).then(([prescriptions, staff]) => {
      setPrescriptions(prescriptions);
      setStaff(staff);
      setLoading(false);
    });
  }, []);

  async function handleAssignStaff(prescriptionId: string, staffId: string) {
    await fetch(`/api/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    });
    setPrescriptions(prescriptions.map(rx => rx.id === prescriptionId ? { ...rx, staff: staff.find(s => s.id === staffId) } : rx));
  }

  async function handleUpdateStatus(prescriptionId: string, status: string) {
    await fetch(`/api/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setPrescriptions(prescriptions.map(rx => rx.id === prescriptionId ? { ...rx, status } : rx));
  }

  async function handleUpdatePayment(prescriptionId: string, paymentStatus: string) {
    await fetch(`/api/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus }),
    });
    setPrescriptions(prescriptions.map(rx => rx.id === prescriptionId ? { ...rx, paymentStatus } : rx));
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Prescriptions</h2>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Description</th><th>User</th><th>Staff</th><th>Status</th><th>Payment</th><th>Delivery</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {prescriptions.map(rx => (
              <tr key={rx.id}>
                <td>{rx.description}</td>
                <td>{rx.user?.name} ({rx.user?.email})</td>
                <td>
                  <select value={rx.staff?.id || ''} onChange={e => handleAssignStaff(rx.id, e.target.value)} className="input input-bordered">
                    <option value="">Unassigned</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td>
                  <select value={rx.status} onChange={e => handleUpdateStatus(rx.id, e.target.value)} className="input input-bordered">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <select value={rx.paymentStatus} onChange={e => handleUpdatePayment(rx.id, e.target.value)} className="input input-bordered">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>
                <td>{rx.deliveryAddress}</td>
                <td>{new Date(rx.createdAt).toLocaleString()}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
