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
  FaTruck 
} from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';

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
  user: { name: string; email: string };
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function StaffDashboard() {
  return (
    <AuthGuard requireAuth={true}>
      <StaffDashboardContent />
    </AuthGuard>
  );
}

function StaffDashboardContent() {
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

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user && !['staff', 'admin'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['staff', 'admin'].includes(user.role)) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent prescriptions
      const response = await fetch('/api/staff/prescriptions?limit=5', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const prescriptions = data.data.prescriptions;
          setRecentPrescriptions(prescriptions);
          
          // Calculate stats
          const total = data.data.pagination.totalPrescriptions;
          const pending = prescriptions.filter((p: any) => ['pending', 'approved'].includes(p.status)).length;
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'payment_pending': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      case 'ready_to_ship': return 'bg-indigo-100 text-indigo-800';
      case 'dispatched': return 'bg-gray-100 text-gray-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  if (!['staff', 'admin'].includes(user.role)) {
    return <div className="p-8">Access denied. Staff privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-600 mt-1">
          {user.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'} - Manage your prescription assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaPrescriptionBottleAlt className="h-6 w-6 text-blue-600" />
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
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ready to Ship</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.readyToShip}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTruck className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dispatched</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.dispatched}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.delivered}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/staff-dashboard/prescriptions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaPrescriptionBottleAlt className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">View All Prescriptions</h3>
              <p className="text-sm text-gray-500">Manage assigned prescriptions</p>
            </div>
          </Link>

          <Link
            href="/staff-dashboard/prescriptions?status=ready_to_ship"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaClock className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Ready to Ship</h3>
              <p className="text-sm text-gray-500">Items waiting for dispatch</p>
            </div>
          </Link>

          <Link
            href="/staff-dashboard/prescriptions?status=dispatched"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaTruck className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Track Dispatched</h3>
              <p className="text-sm text-gray-500">Monitor deliveries</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Prescriptions</h2>
        </div>
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : recentPrescriptions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No prescriptions assigned</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prescription.user.name}</div>
                        <div className="text-sm text-gray-500">{prescription.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prescription.medicine}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(prescription.status)}`}>
                          {prescription.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            href="/staff-dashboard/prescriptions"
            className="text-sm text-blue-600 hover:text-blue-900 font-medium"
          >
            View all prescriptions →
          </Link>
        </div>
      </div>
    </div>
  );
}
