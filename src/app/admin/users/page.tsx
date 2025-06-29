'use client';

import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: { name: string };
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, roleId }),
    });
    const newUser = await res.json();
    setUsers([...users, newUser]);
    setName(''); setEmail(''); setPassword(''); setRoleId('');
  }

  async function handleDeleteUser(id: string) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>
      <form className="space-x-2 mb-4" onSubmit={handleAddUser}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="input input-bordered" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input input-bordered" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="input input-bordered" required />
        <input value={roleId} onChange={e => setRoleId(e.target.value)} placeholder="Role ID" className="input input-bordered" required />
        <button type="submit" className="btn btn-primary">Add User</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role?.name}</td>
                <td>
                  <button className="btn btn-error btn-xs" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
