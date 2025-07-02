'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPrescriptionBottleAlt, 
  FaUsers, 
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaEdit,
  FaPoundSign
} from 'react-icons/fa';

interface DashboardStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  readyToShip: number;
  dispatched: number;
  delivered: number;
}

interface RecentPrescription {
  id: number;
  medicine: string;
  quantity: number;
  amount: number;
  user: { name: string; email: string };
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function SupervisorPrescriptions() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    readyToShip: 0,
    dispatched: 0,
    delivered: 0
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState<RecentPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pricingModal, setPricingModal] = useState<{ prescription: RecentPrescription; newPrice: string } | null>(null);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user && !['supervisor', 'admin'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['supervisor', 'admin'].includes(user.role)) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent prescriptions
      const response = await fetch('/api/staff/prescriptions?limit=10', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const prescriptions = data.data.prescriptions;
          setRecentPrescriptions(prescriptions);
          
          // Calculate stats
          const total = data.data.pagination.totalPrescriptions;
          const pending = prescriptions.filter((p: any) => ['pending'].includes(p.status)).length;
          const ready = prescriptions.filter((p: any) => p.status === 'ready_to_ship').length;
          const dispatched = prescriptions.filter((p: any) => p.status === 'dispatched').length;
          const delivered = prescriptions.filter((p: any) => p.status === 'delivered').length;
          
          setStats({
            totalPrescriptions: total,
            pendingPrescriptions: pending,
            readyToShip: ready,
            dispatched,
            delivered
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePricing = async () => {
    if (!pricingModal) return;

    try {
      const response = await fetch(`/api/prescriptions/${pricingModal.prescription.id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          price: parseFloat(pricingModal.newPrice)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the prescription in the local state
          setRecentPrescriptions(prev =>
            prev.map(p =>
              p.id === pricingModal.prescription.id
                ? { ...p, amount: parseFloat(pricingModal.newPrice) }
                : p
            )
          );
          
          setPricingModal(null);
          alert('Pricing updated successfully!');
        } else {
          alert(data.message || 'Failed to update pricing');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update pricing');
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('Error updating pricing');
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

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaPrescriptionBottleAlt className="text-purple-600" />
          Prescription Management
        </h1>
        <Link
          href="/supervisor-dashboard/approvals"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <FaCheckCircle />
          View Approvals ({stats.pendingPrescriptions})
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPrescriptionBottleAlt className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPrescriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaClock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingPrescriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ready to Ship</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.readyToShip}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaTruck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dispatched</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.dispatched}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
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
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
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
              {recentPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.medicine}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prescription.user.name}</div>
                    <div className="text-sm text-gray-500">{prescription.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prescription.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        £{prescription.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => setPricingModal({ prescription, newPrice: prescription.amount.toString() })}
                        className="text-purple-600 hover:text-purple-800 p-1"
                        title="Update Price"
                      >
                        <FaEdit className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(prescription.status)}`}>
                      {prescription.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadgeColor(prescription.paymentStatus)}`}>
                      {prescription.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(prescription.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.status === 'pending' && (
                      <Link
                        href="/supervisor-dashboard/approvals"
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Review
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Modal */}
      {pricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Prescription Price</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{pricingModal.prescription.medicine}</p>
              <p className="text-sm text-gray-600">Patient: {pricingModal.prescription.user.name}</p>
              <p className="text-sm text-gray-600">Quantity: {pricingModal.prescription.quantity}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricingModal.newPrice}
                onChange={(e) => setPricingModal({ ...pricingModal, newPrice: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPricingModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePricing}
                disabled={!pricingModal.newPrice || parseFloat(pricingModal.newPrice) <= 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
