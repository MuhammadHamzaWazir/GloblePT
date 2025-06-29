import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';

interface SEOSetting {
  page: string;
  title: string;
  description: string;
  canonical?: string;
}

export default function AssistantPortal() {
  const { user } = useAuth();
  if (!user || user.role !== 'assistant') {
    return <div className="p-8 text-red-600">Access denied. Assistants only.</div>;
  }

  const [seo, setSeo] = useState<SEOSetting[]>([]);
  const [page, setPage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [canonical, setCanonical] = useState('');
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-xl font-bold mb-4">SEO Management</h2>
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
        <input value={page} onChange={e => setPage(e.target.value)} placeholder="Page Path (e.g. /about)" className="input input-bordered w-full" required />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Meta Title" className="input input-bordered w-full" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Meta Description" className="input input-bordered w-full" required />
        <input value={canonical} onChange={e => setCanonical(e.target.value)} placeholder="Canonical URL (optional)" className="input input-bordered w-full" />
        <button type="submit" className="btn btn-primary w-full">Save</button>
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
