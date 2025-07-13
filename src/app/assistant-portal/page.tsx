'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';

interface SEOSetting {
  page: string;
  title: string;
  description: string;
  canonical?: string;
}

export default function AssistantPortal() {
  return (
    <AuthGuard requireAuth={true}>
      <AssistantPortalContent />
    </AuthGuard>
  );
}

function AssistantPortalContent() {
  const { user, isLoggingOut, logout } = useAuth();
  if (!user || user.role !== 'assistant') {
    return <div className="p-8 text-red-600">Access denied. Assistants only.</div>;
  }

  const [seo, setSeo] = useState<SEOSetting[]>([]);
  const [page, setPage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [canonical, setCanonical] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Redirect anyway to clear any cached state
      window.location.replace('/auth/login?logout=true');
    }
  };

  useEffect(() => {
    fetch('/api/seo').then(res => res.json()).then(setSeo).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, title, description, canonical }),
    });
    setSeo([...seo.filter(s => s.page !== page), { page, title, description, canonical }]);
    setPage(''); setTitle(''); setDescription(''); setCanonical('');
  }

  async function handleDelete(page: string) {
    await fetch('/api/seo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    });
    setSeo(seo.filter(s => s.page !== page));
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">SEO Management</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoggingOut ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging out...
            </>
          ) : (
            'Logout'
          )}
        </button>
      </div>
      {/* Analytics Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Website Analytics</h3>
        {/* Replace the src below with your Google Analytics or Plausible dashboard embed URL */}
        <iframe
          src="https://plausible.io/share/example.com?auth=yourtoken&embed=true"
          style={{ width: '100%', height: 400, border: 0 }}
          allowFullScreen
          title="Analytics Dashboard"
        />
      </div>
      <form className="space-y-2 mb-4" onSubmit={handleSave}>
        <input 
          value={page} 
          onChange={e => setPage(e.target.value)} 
          placeholder="Page Path (e.g. /about)" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
          required 
        />
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Meta Title" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
          required 
        />
        <input 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Meta Description" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
          required 
        />
        <input 
          value={canonical} 
          onChange={e => setCanonical(e.target.value)} 
          placeholder="Canonical URL (optional)" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="table w-full">
          <thead>
            <tr><th>Page</th><th>Title</th><th>Description</th><th>Canonical</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {seo.map(s => (
              <tr key={s.page}>
                <td>{s.page}</td>
                <td>{s.title}</td>
                <td>{s.description}</td>
                <td>{s.canonical}</td>
                <td><button className="btn btn-error btn-xs" onClick={() => handleDelete(s.page)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
