'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { 
  FaPrescriptionBottleAlt, 
  FaShoppingCart, 
  FaClock, 
  FaCheck, 
  FaEye,
  FaTimes,
  FaFileDownload,
  FaPills,
  FaChartLine,
  FaCalendarAlt,
  FaPlus
} from 'react-icons/fa';

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
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    orderNumber: string;
    status: string;
    estimatedDelivery: string;
    trackingNumber?: string;
  };
}

interface MedicineItem {
  name: string;
  quantity: number;
  dosage: string;
  instructions: string;
}

interface DashboardStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  completedPrescriptions: number;
  totalOrders: number;
  paidOrders: number;
  totalSpent: number;
}

export default function UserDashboard() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    approvedPrescriptions: 0,
    completedPrescriptions: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState({
    status: 'pending', // 'pending', 'verified', 'rejected'
    hasPhotoId: false,
    hasAddressProof: false,
    hasNationalInsurance: false,
    hasNHS: false,
    verifiedBy: null,
    verifiedAt: null,
    notes: null,
    documentSubmitted: false
  });
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
      checkIdentityStatus();
      // Check for payment status in URL
      checkPaymentStatus();
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [user, router]);

  // Refresh verification status when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        checkIdentityStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Auto-refresh verification status every 30 seconds if status is pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (user && verificationStatus.status === 'pending') {
      interval = setInterval(() => {
        checkIdentityStatus();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, verificationStatus.status]);

  // Check payment status from URL parameters
  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const prescriptionId = urlParams.get('prescription');
    const sessionId = urlParams.get('payment_intent'); // This is actually the session ID

    if (paymentStatus === 'success' && prescriptionId && sessionId) {
      // Show success alert with order information
      const showSuccessAlert = () => {
        alert(`🎉 Payment Successful!\n\n✅ Prescription #${prescriptionId} has been paid\n📦 Your order is now being prepared\n🚚 You will receive tracking information once dispatched\n\nThank you for your order!`);
      };
      
      // Immediately update prescription status via API
      const updatePaymentStatus = async () => {
        try {
          const response = await fetch('/api/payment-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prescriptionId: parseInt(prescriptionId),
              sessionId: sessionId
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Payment status updated immediately:', result);
            
            // Show success alert with order details
            setTimeout(() => {
              alert(`🎉 Payment Successful!\n\n✅ Prescription #${prescriptionId} has been paid\n📦 Order #${result.order.orderNumber} is being prepared\n🚚 Estimated delivery: ${new Date(result.order.estimatedDelivery).toLocaleDateString()}\n\nThank you for your order!`);
            }, 500);
          } else {
            console.error('❌ Failed to update payment status immediately');
            showSuccessAlert();
          }
        } catch (error) {
          console.error('❌ Error updating payment status:', error);
          showSuccessAlert();
        }
      };
      
      // Update payment status
      updatePaymentStatus();
      
      // Refresh prescriptions to show updated status
      setTimeout(() => {
        fetchPrescriptions();
      }, 1000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    } else if (paymentStatus === 'cancelled') {
      alert('❌ Payment was cancelled.\n\nYou can try again later from your dashboard.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Use the updated API endpoint that returns stats
      const response = await fetch('/api/prescriptions/user', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const prescriptionData = data.prescriptions || [];
        setPrescriptions(prescriptionData);
        
        // Use statistics from API if available
        const statsFromAPI = data.stats;
        if (statsFromAPI) {
          setStats(statsFromAPI);
        } else {
          // Fallback to calculating stats from prescriptions
          const totalPrescriptions = prescriptionData.length;
          const pendingPrescriptions = prescriptionData.filter((p: any) => p.status === 'pending').length;
          const approvedPrescriptions = prescriptionData.filter((p: any) => p.status === 'approved').length;
          const completedPrescriptions = prescriptionData.filter((p: any) => 
            p.status === 'completed' || p.status === 'delivered'
          ).length;
          const paidOrders = prescriptionData.filter((p: any) => p.paymentStatus === 'paid').length;
          const totalSpent = prescriptionData
            .filter((p: any) => p.paymentStatus === 'paid')
            .reduce((sum: number, p: any) => sum + p.amount, 0);

          setStats({
            totalPrescriptions,
            pendingPrescriptions,
            approvedPrescriptions,
            completedPrescriptions,
            totalOrders: totalPrescriptions,
            paidOrders,
            totalSpent
          });
        }
      } else {
        console.error('Failed to fetch prescriptions:', data.message);
        setError('Failed to load prescriptions');
      }
    } catch (err) {
      setError('Error loading prescriptions');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIdentityStatus = async () => {
    try {
      const response = await fetch('/api/users/verification-status');
      if (response.ok) {
        const data = await response.json();
        const newStatus = data.verification;
        
        // Show alert if status changed to verified or rejected
        if (verificationStatus.status === 'pending' && 
            (newStatus.status === 'verified' || newStatus.status === 'rejected')) {
          setShowVerificationAlert(true);
          // Auto-hide alert after 10 seconds
          setTimeout(() => setShowVerificationAlert(false), 10000);
        }
        
        setVerificationStatus(newStatus);
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  // Handle payment
  const handlePayment = async (prescriptionId: number) => {
    try {
      setPaymentLoading(prescriptionId);
      
      const response = await fetch(`/api/prescriptions/${prescriptionId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success && data.redirectUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message || 'Payment initialization failed');
        setPaymentLoading(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setPaymentLoading(null);
    }
  };

  // Handle prescription cancellation
  const handleCancel = async (prescriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the prescription status locally
        setPrescriptions(prescriptions.map(p => 
          p.id === prescriptionId 
            ? { ...p, status: 'cancelled' }
            : p
        ));
        alert('Prescription cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel prescription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel prescription. Please try again.');
    }
  };

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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">My Dashboard</h1>
          <p className="text-gray-600">
            Overview of your prescription orders and healthcare activity.
          </p>
        </div>

        {/* Statistics Dashboard Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Prescriptions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Prescriptions</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPrescriptions}</p>
                <p className="text-sm text-gray-500 mt-1">All time submissions</p>
              </div>
              <FaPrescriptionBottleAlt className="text-4xl text-blue-500" />
            </div>
          </div>

          {/* Pending Review */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending Review</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingPrescriptions}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          </div>

          {/* Approved Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Approved Orders</h3>
                <p className="text-3xl font-bold text-green-600">{stats.approvedPrescriptions}</p>
                <p className="text-sm text-gray-500 mt-1">Ready for payment</p>
              </div>
              <FaCheck className="text-4xl text-green-500" />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Completed</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.completedPrescriptions}</p>
                <p className="text-sm text-gray-500 mt-1">Delivered orders</p>
              </div>
              <FaCheck className="text-4xl text-emerald-500" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Orders</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Confirmed orders</p>
              </div>
              <FaShoppingCart className="text-4xl text-indigo-500" />
            </div>
          </div>

          {/* Paid Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-cyan-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Paid Orders</h3>
                <p className="text-3xl font-bold text-cyan-600">{stats.paidOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Payment completed</p>
              </div>
              <FaChartLine className="text-4xl text-cyan-500" />
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Spent</h3>
                <p className="text-3xl font-bold text-purple-600">£{stats.totalSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">Paid orders only</p>
              </div>
              <FaChartLine className="text-4xl text-purple-500" />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/dashboard/prescriptions'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Submit New Prescription
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard/prescriptions'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <FaEye className="mr-2" />
                    View All Prescriptions
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
       

      </div>
    </div>
  );
}
