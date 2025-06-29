'use client';

import React, { useEffect, useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, address, phone }),
    });
    const newCustomer = await res.json();
    setCustomers([...customers, newCustomer]);
    setName(''); setEmail(''); setAddress(''); setPhone('');
  }

  async function handleDeleteCustomer(id: string) {
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    setCustomers(customers.filter(c => c.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Customers</h2>
      <form className="space-x-2 mb-4" onSubmit={handleAddCustomer}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input input-bordered" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input input-bordered" required />
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="input input-bordered" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="input input-bordered" />
        <button type="submit" className="btn btn-primary">Add Customer</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Address</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.address}</td>
                <td>{customer.phone}</td>
                <td>
                  <button className="btn btn-error btn-xs" onClick={() => handleDeleteCustomer(customer.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
