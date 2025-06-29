'use client';

import React, { useEffect, useState } from 'react';

interface Complaint {
  id: string;
  name: string;
  email: string;
  message: string;
  fileUrl?: string;
  status: string;
  createdAt: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints')
      .then(res => res.json())
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Complaints</h2>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Message</th><th>File</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.message}</td>
                <td>{c.fileUrl ? <a href={c.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a> : '-'}</td>
                <td>
                  <select value={c.status} onChange={async e => {
                    await fetch('/api/complaints', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: c.id, status: e.target.value }),
                    });
                    setComplaints(complaints.map(cc => cc.id === c.id ? { ...cc, status: e.target.value } : cc));
                  }} className="input input-bordered">
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
