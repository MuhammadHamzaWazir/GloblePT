'use client';

import React, { useEffect, useState } from 'react';

interface Permission {
  id: string;
  name: string;
}
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export default function ManageRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/roles').then(res => res.json()),
      fetch('/api/permissions').then(res => res.json()),
    ]).then(([roles, permissions]) => {
      setRoles(roles);
      setPermissions(permissions);
      setLoading(false);
    });
  }, []);

  async function handleAddRole(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, permissionIds }),
    });
    const newRole = await res.json();
    setRoles([...roles, newRole]);
    setName(''); setPermissionIds([]);
  }

  async function handleDeleteRole(id: string) {
    await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    setRoles(roles.filter(r => r.id !== id));
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Roles & Permissions</h2>
      <form className="space-x-2 mb-4" onSubmit={handleAddRole}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Role Name" className="input input-bordered" required />
        <select multiple value={permissionIds} onChange={e => setPermissionIds(Array.from(e.target.selectedOptions, o => o.value))} className="input input-bordered">
          {permissions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add Role</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Permissions</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.permissions.map(p => p.name).join(', ')}</td>
                <td>
                  <button className="btn btn-error btn-xs" onClick={() => handleDeleteRole(role.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
