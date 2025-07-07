'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPrescriptionBottleAlt, 
  FaUsers, 
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaUserCheck 
} from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';

interface DashboardStats {
  totalPrescriptions: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalStaff: number;
}

interface PendingPrescription {
  id: number;
  medicine: string;
  user: { name: string; email: string };
  amount: number;
  createdAt: string;
  prescriptionText: string;
  quantity: number;
  deliveryAddress: string;
  status: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
}

export default function SupervisorDashboard() {
  return (
    <AuthGuard requireAuth={true}>
      <SupervisorDashboardContent />
    </AuthGuard>
  );
}

function SupervisorDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrescriptions: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    totalStaff: 0
  });
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PendingPrescription[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<PendingPrescription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [newPrice, setNewPrice] = useState('');

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
      
      // Fetch pending prescriptions for approval
      const pendingResponse = await fetch('/api/supervisor/prescriptions?limit=10', {
        credentials: 'include'
      });

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        if (pendingData.success) {
          setPendingPrescriptions(pendingData.data.prescriptions);
          
          // Calculate stats
          setStats(prev => ({
            ...prev,
            pendingApproval: pendingData.data.pagination.totalPrescriptions
          }));
        }
      }

      // Fetch staff list
      const staffResponse = await fetch('/api/staff', {
        credentials: 'include'
      });

      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        console.log('Staff API Response:', staffData); // Debug log
        
        if (staffData.success && staffData.data && staffData.data.staff) {
          setStaffList(staffData.data.staff);
          setStats(prev => ({
            ...prev,
            totalStaff: staffData.data.staff.length
          }));
        } else {
          console.error('Staff API response format error:', staffData);
          setError('Failed to load staff members - invalid response format');
        }
      } else {
        console.error('Staff API request failed:', staffResponse.status, staffResponse.statusText);
        setError('Failed to load staff members');
      }

      // Fetch overall prescription stats
      const statsResponse = await fetch('/api/admin/prescriptions?limit=1', {
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(prev => ({
            ...prev,
            totalPrescriptions: statsData.data.pagination.totalPrescriptions
          }));
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAndAssign = async () => {
    if (!selectedPrescription) {
      setError('No prescription selected');
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await fetch('/api/supervisor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          prescriptionId: selectedPrescription.id,
          action: 'approve'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove approved prescription from the list
        setPendingPrescriptions(prev => prev.filter(p => p.id !== selectedPrescription.id));
        setIsModalOpen(false);
        setSelectedPrescription(null);
        setError('');
        // Refresh stats
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to approve prescription');
      }
    } catch (err) {
      setError('Failed to approve prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPrescription) return;

    const notes = prompt('Please provide a reason for rejection (optional):');
    if (notes === null) return; // User cancelled

    try {
      setActionLoading(true);
      const response = await fetch('/api/supervisor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          prescriptionId: selectedPrescription.id,
          action: 'reject',
          notes: notes || 'Rejected by supervisor'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove rejected prescription from the list
        setPendingPrescriptions(prev => prev.filter(p => p.id !== selectedPrescription.id));
        setIsModalOpen(false);
        setSelectedPrescription(null);
        setError('');
        // Refresh stats
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to reject prescription');
      }
    } catch (err) {
      setError('Failed to reject prescription');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  if (!['supervisor', 'admin'].includes(user.role)) {
    return <div className="p-8">Access denied. Supervisor privileges required.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supervisor Dashboard</h1>
        <p className="text-gray-600">Approve prescriptions and assign to staff members</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaPrescriptionBottleAlt className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Prescriptions</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalPrescriptions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingApproval}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Staff Members</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalStaff}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserCheck className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">My Role</dt>
                  <dd className="text-lg font-medium text-gray-900 capitalize">{user.role}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Prescriptions for Approval */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Prescriptions Pending Approval</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading prescriptions...</div>
        ) : pendingPrescriptions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No prescriptions pending approval</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{prescription.user.name}</div>
                        <div className="text-sm text-gray-500">{prescription.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{prescription.medicine}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      £{prescription.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setNewPrice(prescription.amount.toString());
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link href="/admin/dashboard/prescriptions" className="block text-blue-600 hover:text-blue-800">
              → View All Prescriptions
            </Link>
            <Link href="/staff-dashboard/prescriptions" className="block text-blue-600 hover:text-blue-800">
              → Staff Prescription Management
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Overview</h3>
          {staffList.length > 0 ? (
            <div className="space-y-2">
              {staffList.slice(0, 5).map((staff) => (
                <div key={staff.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{staff.name}</span>
                  <span className="text-xs text-gray-500">{staff.email}</span>
                </div>
              ))}
              {staffList.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">+ {staffList.length - 5} more staff members</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No staff members found</p>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {isModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Review Prescription Request
            </h3>
            
            <div className="mb-6 space-y-3 text-gray-900">
              <div>
                <strong className="text-gray-900">Customer:</strong> <span className="text-gray-700">{selectedPrescription.user.name} ({selectedPrescription.user.email})</span>
              </div>
              <div>
                <strong className="text-gray-900">Medicine:</strong> <span className="text-gray-700">{selectedPrescription.medicine}</span>
              </div>
              <div>
                <strong className="text-gray-900">Quantity:</strong> <span className="text-gray-700">{selectedPrescription.quantity}</span>
              </div>
              <div>
                <strong className="text-gray-900">Delivery Address:</strong> <span className="text-gray-700">{selectedPrescription.deliveryAddress}</span>
              </div>
              <div>
                <strong className="text-gray-900">Prescription Details:</strong>
                <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-800">
                  {selectedPrescription.prescriptionText}
                </div>
              </div>
              <div>
                <strong className="text-gray-900">Submitted:</strong> <span className="text-gray-700">{new Date(selectedPrescription.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter prescription price"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Staff Member
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">Select a staff member...</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id} className="text-gray-900">
                    {staff.name} - {staff.email}
                  </option>
                ))}
              </select>
              {staffList.length === 0 && (
                <p className="text-sm text-red-600 mt-1">No staff members available. Please check staff configuration.</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPrescription(null);
                  setSelectedStaffId('');
                  setNewPrice('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={handleApproveAndAssign}
                disabled={actionLoading || !selectedStaffId}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve & Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
