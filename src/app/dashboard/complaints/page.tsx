import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../lib/auth-context';

interface Complaint {
  id: string;
  message: string;
  fileUrl?: string;
  status: string;
  createdAt: string;
}

export default function UserComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const prevComplaints = useRef<Complaint[]>([]);

  useEffect(() => {
    if (user) {
      fetch('/api/complaints')
        .then(res => res.json())
        .then(all => {
          const userComplaints = all.filter((c: any) => c.userId === user.id);
          // Check for status changes
          if (prevComplaints.current.length) {
            userComplaints.forEach((c: Complaint) => {
              const prev = prevComplaints.current.find(pc => pc.id === c.id);
              if (prev && prev.status !== c.status) {
                setNotification(`Status for your complaint has changed to: ${c.status}`);
                setTimeout(() => setNotification(''), 5000);
              }
            });
          }
          prevComplaints.current = userComplaints;
          setComplaints(userComplaints);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return <div className="p-8 text-red-600">Please log in to view your complaints.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Complaints</h1>
      {notification && <div className="mb-4 text-green-600">{notification}</div>}
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Message</th><th>File</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.message}</td>
                <td>{c.fileUrl ? <a href={c.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a> : '-'}</td>
                <td>{c.status}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
