'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '../../../components/AuthGuard';
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
  id: string;
  medicine: string;
  medicines?: string;
  filename: string;
  fileUrl?: string;
  fileUrls?: string[];
  quantity: number;
  amount: number;
  status: string;
  paymentStatus: string;
  medicineType: string;
  uploadedAt: string;
  updatedAt: string;
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

export default function PrescriptionsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <PrescriptionsContent />
    </AuthGuard>
  );
}

function PrescriptionsContent() {
  const { user } = useAuth();
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
  
  // Form state variables
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: '', quantity: 1, dosage: '', instructions: '' }
  ]);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // File display modal
  const [showFileModal, setShowFileModal] = useState(false);
  const [modalFiles, setModalFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  useEffect(() => {
    fetchPrescriptions();
    loadUserProfile();
    checkPaymentStatus();
  }, []);

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
              alert(`🎉 Payment Successful!\n\n✅ Prescription #${prescriptionId} has been paid\n📦 Order #${result.order?.orderNumber || 'Generated'} is being prepared\n🚚 Estimated delivery: ${result.order?.estimatedDelivery ? new Date(result.order.estimatedDelivery).toLocaleDateString() : 'TBD'}\n\nThank you for your order!`);
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
      window.history.replaceState({}, document.title, '/dashboard/prescriptions');
    } else if (paymentStatus === 'cancelled') {
      alert('❌ Payment was cancelled.\n\nYou can try again later from your prescriptions page.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard/prescriptions');
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        // Auto-populate address from user profile, ensure it's never null
        const userAddress = data.data.address || '';
        setAddress(userAddress);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/prescriptions/user', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const prescriptionData = data.prescriptions || [];
        setPrescriptions(prescriptionData);
        
        // Use statistics from API if available, otherwise calculate locally
        const statsFromAPI = data.stats;
        if (statsFromAPI) {
          setStats(statsFromAPI);
        } else {
          // Fallback to local calculation
          const stats = calculateStats(prescriptionData);
          setStats(stats);
        }
      } else {
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed to fetch prescriptions:', errorMessage);
        setError(`Failed to load prescriptions: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching prescriptions:', error);
      setError(`Failed to load prescriptions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (prescriptions: Prescription[]): DashboardStats => {
    const totalPrescriptions = prescriptions.length;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
    const approvedPrescriptions = prescriptions.filter(p => p.status === 'approved').length;
    const completedPrescriptions = prescriptions.filter(p => 
      p.status === 'completed' || p.status === 'delivered'
    ).length;
    const paidOrders = prescriptions.filter(p => p.paymentStatus === 'paid').length;
    const totalSpent = prescriptions
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPrescriptions,
      pendingPrescriptions,
      approvedPrescriptions,
      completedPrescriptions,
      totalOrders: totalPrescriptions, // Same as prescriptions for now
      paidOrders,
      totalSpent
    };
  };

  const openFileModal = (files: {name: string, url: string, type: string}[], startIndex: number = 0) => {
    setModalFiles(files);
    setCurrentFileIndex(startIndex);
    setShowFileModal(true);
  };

  const closeFileModal = () => {
    setShowFileModal(false);
    setModalFiles([]);
    setCurrentFileIndex(0);
  };

  const nextFile = () => {
    setCurrentFileIndex((prev) => (prev + 1) % modalFiles.length);
  };

  const prevFile = () => {
    setCurrentFileIndex((prev) => (prev - 1 + modalFiles.length) % modalFiles.length);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getMedicinesDisplay = (prescription: Prescription) => {
    if (prescription.medicines) {
      try {
        const medicines = JSON.parse(prescription.medicines);
        if (Array.isArray(medicines) && medicines.length > 0) {
          return medicines;
        }
      } catch (error) {
        console.error('Error parsing medicines:', error);
      }
    }
    
    return [{
      name: prescription.medicine,
      quantity: prescription.quantity,
      dosage: '',
      instructions: ''
    }];
  };

  // Form handling functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate medicines
    const validMedicines = medicines.filter(med => med.name.trim() !== '');
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }
    
    if (selectedFiles.length === 0) {
      setError('Please upload at least one prescription file');
      return;
    }
    
    try {
      setUploadLoading(true);
      
      // First upload the files
      const fileFormData = new FormData();
      selectedFiles.forEach(file => {
        fileFormData.append('files', file);
      });
      
      const uploadResponse = await fetch('/api/upload/prescription-files', {
        method: 'POST',
        body: fileFormData,
        credentials: 'include'
      });
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok || !uploadData.success) {
        setError(uploadData.message || 'Failed to upload files');
        return;
      }
      
      // Now create prescription with file URLs
      const medicineText = validMedicines
        .map(med => `${med.name} - Qty: ${med.quantity}${med.dosage ? `, Dosage: ${med.dosage}` : ''}${med.instructions ? `, Instructions: ${med.instructions}` : ''}`)
        .join('\n');
      
      const prescriptionData = {
        prescriptionText: `${desc}\n\nMedicines:\n${medicineText}`,
        medicine: validMedicines[0].name,
        quantity: validMedicines.reduce((total, med) => total + med.quantity, 0),
        deliveryAddress: address,
        medicines: validMedicines,
        fileUrls: uploadData.files.map((f: any) => f.fileUrl),
        filename: uploadData.files[0].originalName
      };
      
      const res = await fetch('/api/prescriptions/submit-with-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
        credentials: 'include'
      });
      
      if (res.ok) {
        const response = await res.json();
        
        // Reset form
        setDesc(''); 
        setAddress(''); 
        setSelectedFiles([]);
        setMedicines([{ name: '', quantity: 1, dosage: '', instructions: '' }]);
        setError('');
        
        // Refresh the prescriptions list
        fetchPrescriptions();
        
        alert('Prescription submitted successfully! It will be reviewed by our pharmacy team.');
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to submit prescription' }));
        setError(errorData.message || 'Failed to submit prescription');
        console.error('Prescription submission failed:', errorData);
      }
    } catch (err) {
      setError('Error submitting prescription: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error submitting prescription:', err);
    } finally {
      setUploadLoading(false);
    }
  };

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

  // Payment handling
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const handlePayment = async (prescriptionId: string, amount: number) => {
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

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
        <p className="text-gray-600">
          Detailed view of all your prescription submissions and their status.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
              value={desc || ''}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your prescription or medical condition..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
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
                        value={medicine.name || ''}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={medicine.quantity || 1}
                        onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={medicine.dosage || ''}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medicine.instructions || ''}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
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
              value={address || ''}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full delivery address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              rows={3}
              required
            />
          </div>

          {/* Prescription File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription Files *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FaFileDownload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Upload your prescription files</p>
              <p className="text-sm text-gray-500 mb-4">Support for images (JPG, PNG) and PDF documents</p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <div className="flex items-center">
                          <FaFileDownload className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                * File upload is required for prescription validation
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploadLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              {uploadLoading ? (
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

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <FaPrescriptionBottleAlt className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions submitted</h3>
            <p className="text-gray-500 mb-4">
              You haven't submitted any prescriptions yet.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/prescriptions/submit'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition-colors"
            >
              <FaPlus className="mr-2" />
              Submit Your First Prescription
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {prescriptions.slice(0, 5).map((prescription) => (
              <div key={prescription.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {(() => {
                      const medicines = getMedicinesDisplay(prescription);
                      return (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {medicines.length > 1 ? 'Multiple Medicines Prescription' : prescription.medicine}
                          </h3>
                          
                          {medicines.length > 1 && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Medicines in this prescription:</h4>
                              <div className="space-y-2">
                                {medicines.map((med: any, index: number) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium text-gray-900">{med.name}</span>
                                    {med.quantity && <span className="text-gray-600"> • Qty: {med.quantity}</span>}
                                    {med.dosage && <span className="text-gray-600"> • Dosage: {med.dosage}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()} • 
                            Total Quantity: {prescription.quantity}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-right ml-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(prescription.status)}`}>
                      {formatStatus(prescription.status)}
                    </div>
                    {prescription.amount > 0 && (
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        £{prescription.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* File Display Section */}
                {(prescription.fileUrls && prescription.fileUrls.length > 0) || prescription.fileUrl ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaEye className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Prescription Files ({prescription.fileUrls?.length || 1})
                      </span>
                    </div>
                    
                    {prescription.fileUrls && prescription.fileUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {prescription.fileUrls.map((fileUrl, index) => {
                          const fileName = prescription.filename || `File ${index + 1}`;
                          const isImage = fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/);
                          const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                const allFiles = prescription.fileUrls!.map((url, i) => ({
                                  name: i === 0 ? prescription.filename || `File ${i + 1}` : `File ${i + 1}`,
                                  url: url,
                                  type: url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                                }));
                                openFileModal(allFiles, index);
                              }}
                              className="text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                {isImage ? (
                                  <img 
                                    src={fileUrl} 
                                    alt={fileName}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                ) : isPdf ? (
                                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                    <FaFileDownload className="text-red-600 text-xs" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                    <FaFileDownload className="text-gray-600 text-xs" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 truncate">
                                    {index === 0 ? fileName : `File ${index + 1}`}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : prescription.fileUrl ? (
                      <button
                        onClick={() => {
                          const fileData = [{
                            name: prescription.filename || 'Prescription Document',
                            url: prescription.fileUrl!,
                            type: prescription.fileUrl!.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                          }];
                          openFileModal(fileData, 0);
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm transition-colors"
                      >
                        <FaEye className="mr-2" />
                        View Prescription Document
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {/* Pay Now Button */}
                {prescription.status.toLowerCase() === 'approved' && prescription.amount > 0 && prescription.paymentStatus === 'unpaid' && (
                  <div className="mb-4">
                    <button
                      onClick={() => handlePayment(prescription.id, prescription.amount)}
                      disabled={paymentLoading === prescription.id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                      {paymentLoading === prescription.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Last updated: {new Date(prescription.updatedAt).toLocaleString()} • 
                  Payment: {prescription.paymentStatus}
                </div>
              </div>
            ))}
            
            {prescriptions.length > 5 && (
              <div className="p-6 text-center">
                <button
                  onClick={() => window.location.href = '/dashboard/prescriptions/all'}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Prescriptions ({prescriptions.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Display Modal */}
      {showFileModal && modalFiles.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeFileModal();
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Prescription Files ({currentFileIndex + 1} of {modalFiles.length})
                </h3>
                <p className="text-sm text-gray-600">{modalFiles[currentFileIndex]?.name}</p>
              </div>
              <button
                onClick={closeFileModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {modalFiles[currentFileIndex]?.type.startsWith('image/') ? (
                <img
                  src={modalFiles[currentFileIndex].url}
                  alt={modalFiles[currentFileIndex].name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : modalFiles[currentFileIndex]?.type === 'application/pdf' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded">
                  <FaFileDownload className="text-6xl text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">PDF Document</p>
                  <p className="text-sm text-gray-500 mb-4">{modalFiles[currentFileIndex].name}</p>
                  <a
                    href={modalFiles[currentFileIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <FaFileDownload className="mr-2" />
                    Open PDF
                  </a>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <FaFileDownload className="text-6xl text-gray-400 mb-4 mx-auto" />
                    <p className="text-lg font-medium text-gray-700 mb-2">File Preview Not Available</p>
                    <p className="text-sm text-gray-500 mb-4">{modalFiles[currentFileIndex].name}</p>
                    <a
                      href={modalFiles[currentFileIndex].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors mx-auto"
                    >
                      <FaFileDownload className="mr-2" />
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Navigation */}
            {modalFiles.length > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <button
                  onClick={prevFile}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-2">
                  {modalFiles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFileIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentFileIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextFile}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
