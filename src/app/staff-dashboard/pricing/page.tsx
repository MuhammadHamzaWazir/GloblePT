'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  FaPoundSign, 
  FaPrescriptionBottleAlt,
  FaUser,
  FaCalendar,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface Prescription {
  id: number;
  medicine: string;
  quantity: number;
  amount: number;
  prescriptionText: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function StaffPricingManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user && !['staff', 'admin'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['staff', 'admin'].includes(user.role)) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff/prescriptions?limit=50', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrescriptions(data.data.prescriptions || []);
        }
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (err) {
      setError('Error loading prescriptions');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (prescription: Prescription) => {
    setEditingId(prescription.id);
    setNewPrice(prescription.amount.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewPrice('');
  };

  const handleSavePrice = async (prescriptionId: number) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setSavingId(prescriptionId);
      
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          price: parseFloat(newPrice)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the prescription in the local state
          setPrescriptions(prev =>
            prev.map(p =>
              p.id === prescriptionId
                ? { ...p, amount: parseFloat(newPrice) }
                : p
            )
          );
          
          setEditingId(null);
          setNewPrice('');
          
          // Show success message
          alert('Price updated successfully!');
        } else {
          alert(data.message || 'Failed to update price');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update price');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error updating price');
    } finally {
      setSavingId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ready_to_ship': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditPrice = (prescription: Prescription) => {
    return ['pending', 'approved'].includes(prescription.status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaPoundSign className="text-blue-600" />
          Pricing Management
        </h1>
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-blue-800 font-medium">
            {prescriptions.length} Prescriptions
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Prescription Pricing</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update pricing for pending and approved prescriptions
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaPrescriptionBottleAlt className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{prescription.medicine}</div>
                        {prescription.prescriptionText && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {prescription.prescriptionText}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">{prescription.user.name}</div>
                        <div className="text-xs text-gray-500">{prescription.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prescription.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === prescription.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        £{prescription.amount.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(prescription.status)}`}>
                      {prescription.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendar className="h-4 w-4 mr-2" />
                      {formatDate(prescription.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === prescription.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSavePrice(prescription.id)}
                          disabled={savingId === prescription.id}
                          className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                          title="Save"
                        >
                          <FaCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingId === prescription.id}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title="Cancel"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      canEditPrice(prescription) && (
                        <button
                          onClick={() => handleStartEdit(prescription)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Price"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {prescriptions.length === 0 && (
            <div className="text-center py-12">
              <FaPrescriptionBottleAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-gray-500">There are no prescriptions to manage pricing for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
