import React from 'react';
import { useAuth } from '../../lib/auth-context';

export default function AdminPanel() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-red-600">Access denied. Admins only.</div>;
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <ul className="space-y-2">
        <li><a href="/admin/users" className="text-blue-600 underline">Manage Users</a></li>
        <li><a href="/admin/customers" className="text-blue-600 underline">Manage Customers</a></li>
        <li><a href="/admin/staff" className="text-blue-600 underline">Manage Staff</a></li>
        <li><a href="/admin/roles" className="text-blue-600 underline">Manage Roles & Permissions</a></li>
      </ul>
    </div>
  );
}
