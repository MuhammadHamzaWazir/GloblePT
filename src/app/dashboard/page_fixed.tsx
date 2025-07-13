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
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: '', quantity: 1, dosage: '', instructions: '' }
  ]);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    // Validate medicines
    const validMedicines = medicines.filter(med => med.name.trim() !== '');
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }
    
    try {
      const medicineText = validMedicines
        .map(med => `${med.name} - Qty: ${med.quantity}${med.dosage ? `, Dosage: ${med.dosage}` : ''}${med.instructions ? `, Instructions: ${med.instructions}` : ''}`)
        .join('\n');
      
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          prescriptionText: `${desc}\n\nMedicines:\n${medicineText}`, 
          medicine: validMedicines[0].name, // Primary medicine
          quantity: validMedicines.reduce((total, med) => total + med.quantity, 0), // Total quantity
          deliveryAddress: address,
          medicines: validMedicines
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
        setMedicines([{ name: '', quantity: 1, dosage: '', instructions: '' }]);
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

  // Add new medicine item
  const addMedicine = () => {
    setMedicines([...medicines, { name: '', quantity: 1, dosage: '', instructions: '' }]);
  };

  // Remove medicine item
  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  // Update medicine item
  const updateMedicine = (index: number, field: keyof MedicineItem, value: string | number) => {
    const updated = medicines.map((medicine, i) => 
      i === index ? { ...medicine, [field]: value } : medicine
    );
    setMedicines(updated);
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <FaEye className="mr-2" />
                    View All Prescriptions
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard/profile'}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Medical History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Submission Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Submit New Prescription</h2>
            <p className="text-gray-600">Upload your prescription files and add medicine details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe your prescription or medical condition..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                required
              />
            </div>

            {/* Medicines Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medicines Required
                </label>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Medicine {index + 1}</h4>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          placeholder="e.g., Paracetamol"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={medicine.quantity}
                          onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={medicine.instructions}
                          onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                required
              />
            </div>

            {/* Prescription File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Image/Document *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FaFileDownload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload your prescription files</p>
                <p className="text-sm text-gray-500 mb-4">Support for images (JPG, PNG) and PDF documents</p>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL or upload files above..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  * File upload is required for prescription validation
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPrescriptionBottleAlt className="mr-2" />
                    Submit Prescription
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Prescriptions */}
        {prescriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Prescriptions</h2>
              <p className="text-gray-600">Your latest prescription submissions</p>
            </div>

            <div className="divide-y divide-gray-200">
              {prescriptions.slice(0, 3).map((prescription) => (
                <div key={prescription.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {prescription.medicine}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity: {prescription.quantity} • 
                        Submitted: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      {prescription.prescriptionText && (
                        <p className="text-sm text-gray-700 mb-2">
                          {prescription.prescriptionText.substring(0, 150)}
                          {prescription.prescriptionText.length > 150 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        prescription.status === 'approved' ? 'bg-green-100 text-green-800' :
                        prescription.status === 'completed' || prescription.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        prescription.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </div>
                      {prescription.amount > 0 && (
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          £{prescription.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {prescription.status === 'approved' && prescription.paymentStatus === 'unpaid' && prescription.amount > 0 && (
                      <button
                        onClick={() => handlePayment(prescription.id)}
                        disabled={paymentLoading === prescription.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                      >
                        {paymentLoading === prescription.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaPills className="mr-2" />
                            Pay Now - £{prescription.amount.toFixed(2)}
                          </>
                        )}
                      </button>
                    )}

                    {prescription.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(prescription.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    )}

                    {prescription.order?.trackingNumber && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm">
                        <strong>Tracking:</strong> {prescription.order.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {prescriptions.length > 3 && (
                <div className="p-6 text-center">
                  <button
                    onClick={() => window.location.href = '/dashboard/prescriptions'}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Prescriptions ({prescriptions.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Verification Status Change Alert */}
        {showVerificationAlert && (
          <div className={`border px-6 py-4 rounded-lg mb-6 ${
            verificationStatus.status === 'verified' 
              ? 'bg-green-100 border-green-400 text-green-800' 
              : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {verificationStatus.status === 'verified' ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    {verificationStatus.status === 'verified' 
                      ? '🎉 Identity Verification Approved!' 
                      : '❌ Identity Verification Rejected'}
                  </h3>
                  <p className="text-sm mt-1">
                    {verificationStatus.status === 'verified' 
                      ? `Your identity has been verified by ${verificationStatus.verifiedBy}. You can now access all pharmacy services.`
                      : `Your identity verification was rejected by ${verificationStatus.verifiedBy}. Please check the notes below and resubmit.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationAlert(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
