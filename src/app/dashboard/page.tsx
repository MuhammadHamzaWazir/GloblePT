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

interface MedicineItem {
  name: string;
  quantity: number;
  dosage: string;
  instructions: string;
}

export default function UserDashboard() {
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
  const [identityStatus, setIdentityStatus] = useState({
    hasPhotoId: false,
    hasAddressProof: false,
    verificationComplete: false
  });

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
      checkIdentityStatus();
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

  const checkIdentityStatus = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setIdentityStatus({
          hasPhotoId: !!data.user.file1Url,
          hasAddressProof: !!data.user.file2Url,
          verificationComplete: !!(data.user.file1Url && data.user.file2Url)
        });
      }
    } catch (error) {
      console.error('Failed to check identity status:', error);
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

      if (response.ok && data.success) {
        // Update the prescription status locally
        setPrescriptions(prescriptions.map(p => 
          p.id === prescriptionId 
            ? { ...p, paymentStatus: 'paid', status: 'paid' }
            : p
        ));
        alert('Payment successful!');
      } else {
        alert(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
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
        
        {/* Identity Verification Alert */}
        {!identityStatus.verificationComplete && (
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
                    {!identityStatus.hasPhotoId && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Upload a government-issued photo ID (passport, driving license)
                      </li>
                    )}
                    {!identityStatus.hasAddressProof && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Upload proof of address (utility bill, bank statement)
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
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Photo ID Verified:</span>
              <span className={`font-semibold ${identityStatus.hasPhotoId ? 'text-green-600' : 'text-red-600'}`}>
                {identityStatus.hasPhotoId ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Address Proof Verified:</span>
              <span className={`font-semibold ${identityStatus.hasAddressProof ? 'text-green-600' : 'text-red-600'}`}>
                {identityStatus.hasAddressProof ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Verification Complete:</span>
              <span className={`font-semibold ${identityStatus.verificationComplete ? 'text-green-600' : 'text-red-600'}`}>
                {identityStatus.verificationComplete ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
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
                      <td className="border border-green-200 px-4 py-3">
                        {rx.status === 'approved' && rx.paymentStatus === 'unpaid' && (
                          <>
                            <button 
                              onClick={() => handlePayment(rx.id)} 
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow transition-all mr-2"
                              disabled={paymentLoading === rx.id}
                            >
                              {paymentLoading === rx.id ? 'Processing...' : 'Pay Now'}
                            </button>
                            <button 
                              onClick={() => handleCancel(rx.id)} 
                              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {rx.status === 'paid' && (
                          <span className="text-green-600 font-semibold">Payment Complete</span>
                        )}
                        {rx.status === 'pending' && (
                          <span className="text-gray-600">Awaiting Approval</span>
                        )}
                        {rx.status === 'cancelled' && (
                          <span className="text-red-600">Cancelled</span>
                        )}
                        {(rx.status === 'dispatched' || rx.status === 'delivered') && (
                          <span className="text-blue-600">In Transit/Delivered</span>
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
