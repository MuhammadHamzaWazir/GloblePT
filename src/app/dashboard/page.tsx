'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

interface Prescription {
  id: number;
  medicine: string;
  dosage?: string;
  instructions?: string;
  quantity: number;
  prescriptionText?: string;
  amount: number;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [user, router]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prescriptions?userId=${user?.id}`);
      if (res.ok) {
        const response = await res.json();
        // The API returns { success: true, data: { prescriptions: [...] } }
        setPrescriptions(response.data?.prescriptions || []);
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (err) {
      setError('Error loading prescriptions');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          prescriptionText: desc, 
          medicine: desc, // Using description as medicine for now
          deliveryAddress: address 
        }),
      });
      
      if (res.ok) {
        const response = await res.json();
        // The API returns { success: true, data: { prescription: {...} } }
        const newRx = response.data?.prescription;
        if (newRx) {
          setPrescriptions([newRx, ...prescriptions]);
        }
        setDesc(''); 
        setAddress(''); 
        setImageUrl('');
        setError('');
        // Refresh the prescriptions list
        fetchPrescriptions();
      } else {
        setError('Failed to submit prescription');
      }
    } catch (err) {
      setError('Error submitting prescription');
      console.error('Error submitting prescription:', err);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-800 mb-6">My Prescriptions Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Submit New Prescription Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Submit New Prescription</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Details
              </label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="Describe your prescription requirements..." 
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all"
                rows={4}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <input 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="Your delivery address" 
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Image URL (Optional)
              </label>
              <input 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                placeholder="Upload image URL of your prescription" 
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg shadow transition-all"
            >
              Submit Prescription
            </button>
          </form>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">My Prescription History</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No prescriptions found. Submit your first prescription above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Medicine</th>
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Quantity</th>
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Amount</th>
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Status</th>
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Payment</th>
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(rx => (
                    <tr key={rx.id} className="hover:bg-gray-50">
                      <td className="border border-green-200 px-4 py-3">{rx.medicine}</td>
                      <td className="border border-green-200 px-4 py-3">{rx.quantity}</td>
                      <td className="border border-green-200 px-4 py-3">£{rx.amount.toFixed(2)}</td>
                      <td className="border border-green-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rx.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          rx.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                          rx.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                          rx.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="border border-green-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rx.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          rx.paymentStatus === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rx.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="border border-green-200 px-4 py-3">{new Date(rx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
