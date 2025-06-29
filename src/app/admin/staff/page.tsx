'use client';

import React, { useEffect, useState } from 'react';

interface Staff {
  id: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
}

export default function ManageStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(setStaff)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, position, phone }),
    });
    const newStaff = await res.json();
    setStaff([...staff, newStaff]);
    setName(''); setEmail(''); setPosition(''); setPhone('');
  }

  async function handleDeleteStaff(id: string) {
    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    setStaff(staff.filter(s => s.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Staff</h2>
      <form className="space-x-2 mb-4" onSubmit={handleAddStaff}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input input-bordered" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input input-bordered" required />
        <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Position" className="input input-bordered" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="input input-bordered" />
        <button type="submit" className="btn btn-primary">Add Staff</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Position</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {staff.map(staff => (
              <tr key={staff.id}>
                <td>{staff.name}</td>
                <td>{staff.email}</td>
                <td>{staff.position}</td>
                <td>{staff.phone}</td>
                <td>
                  <button className="btn btn-error btn-xs" onClick={() => handleDeleteStaff(staff.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
