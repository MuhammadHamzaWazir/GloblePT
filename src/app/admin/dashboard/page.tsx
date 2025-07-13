"use client";

import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import AuthGuard from '@/components/AuthGuard';
import { FaUsers, FaPills, FaPoundSign, FaShoppingCart, FaUserMd, FaClipboardList, FaExclamationTriangle, FaTruck } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

interface DashboardStats {
  totalUsers: number;
  totalPrescriptions: number;
  totalRevenue: number;
  totalOrders: number;
  pendingPrescriptions: number;
  paidOrders: number;
  pendingComplaints: number;
  dispatchedOrders: number;
  usersByRole: {
    admin: number;
    staff: number;
    assistant: number;
    customer: number;
  };
  prescriptionsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    ready_to_ship: number;
    dispatched: number;
    delivered: number;
  };
  paymentsByStatus: {
    paid: number;
    unpaid: number;
    refunded: number;
  };
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminDashboard() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pendingPrescriptions: 0,
    paidOrders: 0,
    pendingComplaints: 0,
    dispatchedOrders: 0,
    usersByRole: { admin: 0, staff: 0, assistant: 0, customer: 0 },
    prescriptionsByStatus: { pending: 0, approved: 0, rejected: 0, ready_to_ship: 0, dispatched: 0, delivered: 0 },
    paymentsByStatus: { paid: 0, unpaid: 0, refunded: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [usersRes, prescriptionsRes, ordersRes, complaintsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/prescriptions', { credentials: 'include' }),
        fetch('/api/orders', { credentials: 'include' }),
        fetch('/api/admin/complaints', { credentials: 'include' }).catch(() => ({ ok: false })) // Optional API
      ]);

      if (!usersRes.ok || !prescriptionsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [usersData, prescriptionsData, ordersData, complaintsData] = await Promise.all([
        usersRes.json(),
        prescriptionsRes.json(),
        ordersRes.ok ? ordersRes.json() : { orders: [] },
        complaintsRes.ok ? (complaintsRes as Response).json() : { complaints: [] }
      ]);

      const users = usersData.users || [];
      const prescriptions = prescriptionsData.data?.prescriptions || prescriptionsData.prescriptions || [];
      const orders = ordersData.orders || [];
      const complaints = complaintsData.complaints || [];

      // Calculate statistics
      const usersByRole = { admin: 0, staff: 0, assistant: 0, customer: 0 };
      users.forEach((user: any) => {
        const role = user.role?.toLowerCase();
        if (role in usersByRole) {
          usersByRole[role as keyof typeof usersByRole]++;
        }
      });

      const prescriptionsByStatus = { pending: 0, approved: 0, rejected: 0, ready_to_ship: 0, dispatched: 0, delivered: 0 };
      const paymentsByStatus = { paid: 0, unpaid: 0, refunded: 0 };
      let totalRevenue = 0;

      prescriptions.forEach((prescription: any) => {
        const status = prescription.status;
        if (status in prescriptionsByStatus) {
          prescriptionsByStatus[status as keyof typeof prescriptionsByStatus]++;
        }
        
        const paymentStatus = prescription.paymentStatus;
        if (paymentStatus in paymentsByStatus) {
          paymentsByStatus[paymentStatus as keyof typeof paymentsByStatus]++;
        }

        if (paymentStatus === 'paid') {
          totalRevenue += prescription.amount || 0;
        }
      });

      const dispatchedOrders = orders.filter((order: any) => order.status === 'dispatched').length;
      const pendingComplaints = complaints.filter((complaint: any) => complaint.status === 'received' || complaint.status === 'investigating').length;

      setStats({
        totalUsers: users.length,
        totalPrescriptions: prescriptions.length,
        totalRevenue,
        totalOrders: orders.length,
        pendingPrescriptions: prescriptionsByStatus.pending,
        paidOrders: paymentsByStatus.paid,
        pendingComplaints,
        dispatchedOrders,
        usersByRole,
        prescriptionsByStatus,
        paymentsByStatus
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Component for individual stat cards
  const StatCard = ({ title, value, icon: Icon, color, description }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    description?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-gray-500 text-xs mt-1">{description}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to your pharmacy management dashboard</p>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 text-lg">Loading dashboard data...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-red-800 font-medium">Dashboard Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && (
        <>
          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={FaUsers}
              color="#3B82F6"
              description="All registered users"
            />
            <StatCard
              title="Total Prescriptions"
              value={stats.totalPrescriptions}
              icon={FaPills}
              color="#10B981"
              description="All prescriptions submitted"
            />
            <StatCard
              title="Total Revenue"
              value={`£${stats.totalRevenue.toFixed(2)}`}
              icon={FaPoundSign}
              color="#F59E0B"
              description="From paid prescriptions"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={FaShoppingCart}
              color="#8B5CF6"
              description="All customer orders"
            />
          </div>

          {/* Secondary Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Pending Prescriptions"
              value={stats.pendingPrescriptions}
              icon={FaClipboardList}
              color="#EF4444"
              description="Awaiting review"
            />
            <StatCard
              title="Paid Orders"
              value={stats.paidOrders}
              icon={FaPoundSign}
              color="#059669"
              description="Successfully paid"
            />
            <StatCard
              title="Dispatched Orders"
              value={stats.dispatchedOrders}
              icon={FaTruck}
              color="#7C3AED"
              description="In transit"
            />
            <StatCard
              title="Pending Complaints"
              value={stats.pendingComplaints}
              icon={FaExclamationTriangle}
              color="#DC2626"
              description="Need attention"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Roles Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles Distribution</h3>
              <div className="h-64">
                <Pie 
                  data={{
                    labels: ['Admin', 'Staff', 'Assistant', 'Customer'],
                    datasets: [{
                      data: [
                        stats.usersByRole.admin, 
                        stats.usersByRole.staff, 
                        stats.usersByRole.assistant, 
                        stats.usersByRole.customer
                      ],
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Prescription Status Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription Status</h3>
              <div className="h-64">
                <Bar 
                  data={{
                    labels: ['Pending', 'Approved', 'Rejected', 'Ready to Ship', 'Dispatched', 'Delivered'],
                    datasets: [{
                      label: 'Prescriptions',
                      data: [
                        stats.prescriptionsByStatus.pending,
                        stats.prescriptionsByStatus.approved,
                        stats.prescriptionsByStatus.rejected,
                        stats.prescriptionsByStatus.ready_to_ship,
                        stats.prescriptionsByStatus.dispatched,
                        stats.prescriptionsByStatus.delivered
                      ],
                      backgroundColor: [
                        '#EF4444', // Pending - Red
                        '#10B981', // Approved - Green
                        '#F87171', // Rejected - Light Red
                        '#3B82F6', // Ready to Ship - Blue
                        '#8B5CF6', // Dispatched - Purple
                        '#059669'  // Delivered - Dark Green
                      ],
                      borderWidth: 1,
                      borderColor: '#ffffff',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Payment Status Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
              <div className="h-64">
                <Pie 
                  data={{
                    labels: ['Paid', 'Unpaid', 'Refunded'],
                    datasets: [{
                      data: [
                        stats.paymentsByStatus.paid, 
                        stats.paymentsByStatus.unpaid, 
                        stats.paymentsByStatus.refunded
                      ],
                      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/admin/dashboard/prescriptions'}
                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <FaPills className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Manage Prescriptions</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/dashboard/users'}
                className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <FaUsers className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Manage Users</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin/dashboard/complaints'}
                className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">View Complaints</span>
              </button>
              <button
                onClick={() => fetchDashboardData()}
                className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <FaClipboardList className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-800 font-medium">Refresh Data</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
