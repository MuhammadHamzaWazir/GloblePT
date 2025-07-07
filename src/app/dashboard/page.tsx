'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

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
}

interface MedicineItem {
  name: string;
  quantity: number;
  dosage: string;
  instructions: string;
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
  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const prescriptionId = urlParams.get('prescription');

    if (paymentStatus === 'success' && prescriptionId) {
      alert(`Payment successful! Prescription #${prescriptionId} has been paid.`);
      // Refresh prescriptions to show updated status
      setTimeout(() => {
        fetchPrescriptions();
      }, 1000);
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    } else if (paymentStatus === 'cancelled') {
      alert('Payment was cancelled. You can try again later.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  };

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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-800 mb-6">My Prescriptions Dashboard</h1>
        
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
        
        {/* Identity Verification Alert */}
        {verificationStatus.status === 'pending' && !verificationStatus.documentSubmitted && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Identity Verification Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>To comply with UK pharmacy regulations, please complete your identity verification:</p>
                  <ul className="mt-2 space-y-1">
                    {!verificationStatus.hasPhotoId && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Upload a government-issued photo ID (passport, driving license)
                      </li>
                    )}
                    {!verificationStatus.hasAddressProof && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Upload proof of address (utility bill, bank statement)
                      </li>
                    )}
                    {!verificationStatus.hasNationalInsurance && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Provide your National Insurance number
                      </li>
                    )}
                    {!verificationStatus.hasNHS && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Provide your NHS number
                      </li>
                    )}
                  </ul>
                  <div className="mt-3">
                    <a 
                      href="/profile"
                      className="text-yellow-800 underline hover:text-yellow-900 font-medium"
                    >
                      Complete verification in your profile →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Identity Verification Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Identity Verification Status</h2>
          
          {/* Overall Status Badge */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Overall Status:</span>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  verificationStatus.status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : verificationStatus.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {verificationStatus.status === 'verified' ? '✓ Verified' : 
                   verificationStatus.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
                </span>
              </div>
            </div>
            
            {verificationStatus.verifiedBy && verificationStatus.verifiedAt && (
              <div className="mt-2 text-sm text-gray-600">
                {verificationStatus.status === 'verified' ? 'Verified' : 'Reviewed'} by {verificationStatus.verifiedBy} on{' '}
                {new Date(verificationStatus.verifiedAt).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
            
            {verificationStatus.notes && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Admin Notes:</strong> {verificationStatus.notes}
                </p>
              </div>
            )}
          </div>

          {/* Document Status Details */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Photo ID Submitted:</span>
              <span className={`font-semibold ${verificationStatus.hasPhotoId ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.hasPhotoId ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Address Proof Submitted:</span>
              <span className={`font-semibold ${verificationStatus.hasAddressProof ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.hasAddressProof ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">National Insurance Number:</span>
              <span className={`font-semibold ${verificationStatus.hasNationalInsurance ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.hasNationalInsurance ? 'Provided' : 'Not Provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">NHS Number:</span>
              <span className={`font-semibold ${verificationStatus.hasNHS ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.hasNHS ? 'Provided' : 'Not Provided'}
              </span>
            </div>
          </div>
          
          {/* Action Needed */}
          {verificationStatus.status === 'pending' && !verificationStatus.documentSubmitted && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Action Required:</strong> Please complete your identity verification by visiting your{' '}
                <a href="/profile" className="underline hover:text-yellow-900">profile page</a>.
              </p>
            </div>
          )}
          
          {verificationStatus.status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Verification Rejected:</strong> Please check the admin notes above and resubmit your documents via your{' '}
                <a href="/profile" className="underline hover:text-red-900">profile page</a>.
              </p>
            </div>
          )}
        </div>

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
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
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
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
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
                className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicines
              </label>
              {medicines.map((medicine, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <input 
                    type="text" 
                    value={medicine.name} 
                    onChange={e => updateMedicine(index, 'name', e.target.value)} 
                    placeholder="Medicine name" 
                    className="flex-1 border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
                    required
                  />
                  <input 
                    type="number" 
                    value={medicine.quantity} 
                    onChange={e => updateMedicine(index, 'quantity', +e.target.value)} 
                    placeholder="Quantity" 
                    className="w-24 border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
                    min="1"
                    required
                  />
                  <input 
                    type="text" 
                    value={medicine.dosage} 
                    onChange={e => updateMedicine(index, 'dosage', e.target.value)} 
                    placeholder="Dosage (optional)" 
                    className="w-32 border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
                  />
                  <input 
                    type="text" 
                    value={medicine.instructions} 
                    onChange={e => updateMedicine(index, 'instructions', e.target.value)} 
                    placeholder="Instructions (optional)" 
                    className="flex-1 border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 rounded-lg transition-all text-black"
                  />
                  {medicines.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedicine(index)} 
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold shadow transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={addMedicine} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg shadow transition-all"
              >
                + Add Another Medicine
              </button>
            </div>
            
            {/* Capacity Assessment & Medicine Safety */}
            <div className="border-2 border-yellow-300 bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">🏥 Safety & Capacity Assessment</h3>
              <p className="text-sm text-yellow-700 mb-4">
                To ensure safe medication dispensing, please confirm the following:
              </p>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-green-600 mt-0.5" 
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I understand the risks and side effects associated with the requested medication(s)
                  </span>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-green-600 mt-0.5" 
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I am able to follow the medication instructions and dosage requirements
                  </span>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-green-600 mt-0.5" 
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I have read and understood all warnings and contraindications
                  </span>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-green-600 mt-0.5" 
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I confirm I have no known allergies to the requested medication(s)
                  </span>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-green-600 mt-0.5" 
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I am 16 years of age or older (required for UK pharmacy services)
                  </span>
                </label>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Prescription Only Medicines (POM) require a valid prescription from a qualified healthcare professional. 
                  Pharmacy Medicines (P) require pharmacist consultation and approval.
                </p>
              </div>
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
                    <th className="border border-green-200 px-4 py-3 text-left text-green-800 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(rx => (
                    <tr key={rx.id} className="hover:bg-gray-50">
                      <td className="border border-green-200 px-4 py-3 text-gray-800">{rx.medicine}</td>
                      <td className="border border-green-200 px-4 py-3 text-gray-800">{rx.quantity}</td>
                      <td className="border border-green-200 px-4 py-3 text-gray-800">£{rx.amount.toFixed(2)}</td>
                      <td className="border border-green-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rx.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          rx.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                          rx.status === 'ready_to_ship' ? 'bg-green-100 text-green-800' :
                          rx.status === 'approved' && rx.amount > 0 ? 'bg-green-100 text-green-800' :
                          rx.status === 'approved' && rx.amount === 0 ? 'bg-yellow-100 text-yellow-800' :
                          rx.status === 'unapproved' ? 'bg-gray-100 text-gray-800' :
                          rx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rx.status === 'ready_to_ship' ? 'READY TO SHIP' :
                           rx.status === 'approved' && rx.amount > 0 ? 'APPROVED - READY FOR PAYMENT' :
                           rx.status === 'approved' && rx.amount === 0 ? 'APPROVED - AWAITING PRICE' :
                           rx.status === 'unapproved' ? 'AWAITING APPROVAL' :
                           rx.status.toUpperCase()}
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
                      <td className="border border-green-200 px-4 py-3 text-gray-800">{new Date(rx.createdAt).toLocaleDateString()}</td>
                      <td className="border border-green-200 px-4 py-3">
                        {/* Payment button shows when prescription is approved/ready with price and unpaid */}
                        {((rx.status === 'approved' || rx.status === 'ready_to_ship') && rx.amount > 0 && rx.paymentStatus === 'unpaid') && (
                          <>
                            <button 
                              onClick={() => handlePayment(rx.id)} 
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow transition-all mr-2"
                              disabled={paymentLoading === rx.id}
                            >
                              {paymentLoading === rx.id ? 'Processing...' : `Pay £${rx.amount.toFixed(2)}`}
                            </button>
                            <button 
                              onClick={() => handleCancel(rx.id)} 
                              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {/* Status messages */}
                        {rx.status === 'unapproved' && (
                          <span className="text-gray-600 text-sm">Awaiting supervisor approval</span>
                        )}
                        {rx.status === 'approved' && rx.amount === 0 && (
                          <span className="text-yellow-600 text-sm">Approved - awaiting price from staff</span>
                        )}
                        {rx.status === 'approved' && rx.amount > 0 && rx.paymentStatus === 'unpaid' && (
                          <span className="text-green-600 text-sm font-semibold">Ready for payment</span>
                        )}
                        {rx.status === 'rejected' && (
                          <span className="text-red-600 text-sm">Rejected by supervisor</span>
                        )}
                        {rx.paymentStatus === 'paid' && (
                          <span className="text-green-600 font-semibold">Payment Complete</span>
                        )}
                        {rx.status === 'dispatched' && (
                          <div className="text-blue-600 text-sm">
                            <div>Dispatched</div>
                            {rx.trackingNumber && (
                              <div className="text-xs text-gray-600">Tracking: {rx.trackingNumber}</div>
                            )}
                          </div>
                        )}
                        {rx.status === 'delivered' && (
                          <span className="text-green-600 font-semibold">Delivered</span>
                        )}
                      </td>
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
