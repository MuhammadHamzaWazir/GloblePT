'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPrescriptionBottleAlt,
  FaUser,
  FaCalendar,
  FaPoundSign,
  FaEye
} from 'react-icons/fa';

interface PendingPrescription {
  id: number;
  medicine: string;
  quantity: number;
  amount: number;
  prescriptionText: string;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface ApprovalModalData {
  prescription: PendingPrescription;
  action: 'approve' | 'reject';
}

export default function SupervisorPrescriptionApprovals() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PendingPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState<ApprovalModalData | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user && !['supervisor', 'admin'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['supervisor', 'admin'].includes(user.role)) {
      fetchPendingPrescriptions();
    }
  }, [user]);

  const fetchPendingPrescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff/prescriptions?status=pending&limit=50', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingPrescriptions(data.data.prescriptions || []);
        }
      } else {
        setError('Failed to load pending prescriptions');
      }
    } catch (err) {
      setError('Error loading prescriptions');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!modalData) return;

    try {
      setProcessingId(modalData.prescription.id);
      
      const response = await fetch(`/api/prescriptions/${modalData.prescription.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: modalData.action,
          price: customPrice ? parseFloat(customPrice) : undefined,
          rejectionReason: modalData.action === 'reject' ? rejectionReason : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove the prescription from pending list
          setPendingPrescriptions(prev => 
            prev.filter(p => p.id !== modalData.prescription.id)
          );
          
          // Close modal and reset form
          setModalData(null);
          setCustomPrice('');
          setRejectionReason('');
          
          // Show success message
          alert(`Prescription ${modalData.action}ed successfully!`);
        } else {
          alert(data.message || `Failed to ${modalData.action} prescription`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to ${modalData.action} prescription`);
      }
    } catch (error) {
      console.error(`Error ${modalData.action}ing prescription:`, error);
      alert(`Error ${modalData.action}ing prescription`);
    } finally {
      setProcessingId(null);
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCheckCircle className="text-purple-600" />
          Prescription Approvals
        </h1>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          <span className="text-purple-800 font-medium">
            {pendingPrescriptions.length} Pending
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pendingPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <FaPrescriptionBottleAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Prescriptions</h3>
          <p className="text-gray-500">All prescriptions have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaPrescriptionBottleAlt className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {prescription.medicine}
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Pending Approval
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUser />
                      <div>
                        <p className="font-medium">{prescription.user.name}</p>
                        <p className="text-xs">{prescription.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPrescriptionBottleAlt />
                      <div>
                        <p className="font-medium">Quantity: {prescription.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPoundSign />
                      <div>
                        <p className="font-medium">£{prescription.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar />
                      <div>
                        <p className="font-medium">{formatDate(prescription.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {prescription.prescriptionText && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Prescription Details:</strong> {prescription.prescriptionText}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-700">
                      <strong>Delivery Address:</strong> {prescription.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <button
                  onClick={() => setModalData({ prescription, action: 'approve' })}
                  disabled={processingId === prescription.id}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  <FaCheckCircle />
                  Approve
                </button>
                
                <button
                  onClick={() => setModalData({ prescription, action: 'reject' })}
                  disabled={processingId === prescription.id}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  <FaTimesCircle />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {modalData.action === 'approve' ? 'Approve' : 'Reject'} Prescription
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{modalData.prescription.medicine}</p>
              <p className="text-sm text-gray-600">Patient: {modalData.prescription.user.name}</p>
              <p className="text-sm text-gray-600">Current Price: £{modalData.prescription.amount.toFixed(2)}</p>
            </div>

            {modalData.action === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Leave blank to keep current price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            )}

            {modalData.action === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setModalData(null);
                  setCustomPrice('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={processingId === modalData.prescription.id || (modalData.action === 'reject' && !rejectionReason.trim())}
                className={`px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 ${
                  modalData.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === modalData.prescription.id
                  ? 'Processing...'
                  : modalData.action === 'approve'
                  ? 'Approve'
                  : 'Reject'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
