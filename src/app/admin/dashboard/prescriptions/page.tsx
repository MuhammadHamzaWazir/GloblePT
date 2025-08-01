'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Prescription {
  id: number;
  medicine: string;
  dosage?: string;
  instructions?: string;
  quantity: number;
  prescriptionText: string;
  amount: number;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPrescriptions: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [selectedPrescriptionForPrice, setSelectedPrescriptionForPrice] = useState<Prescription | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user) {
      setLoading(false);
    }
  }, [user, router]);

  // Fetch prescriptions
  const fetchPrescriptions = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/prescriptions?${params}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPrescriptions(data.data.prescriptions);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch prescriptions');
      }
    } catch (err) {
      setError('Failed to fetch prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPrescriptions();
    }
  }, [user, search, statusFilter]);

  // Handle status change
  const handleStatusChange = async (prescriptionId: number, newStatus: string) => {
    try {
      setActionLoading(true);
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'dispatched' && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
        if (courierName) {
          updateData.courierName = courierName;
        }
      }
      
      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejectedReason = rejectionReason;
      }

      const response = await fetch(`/api/admin/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the prescriptions list
        fetchPrescriptions(pagination?.currentPage || 1);
        setIsModalOpen(false);
        setSelectedPrescription(null);
        setTrackingNumber('');
        setCourierName('');
        setRejectionReason('');
      } else {
        setError(data.message || 'Failed to update prescription');
      }
    } catch (err) {
      setError('Failed to update prescription');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create payment
  const handleCreatePayment = async (prescriptionId: number) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/prescriptions/${prescriptionId}/create-payment`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the prescriptions list
        fetchPrescriptions(pagination?.currentPage || 1);
        alert('Payment link created successfully! Customer will be notified.');
      } else {
        setError(data.message || 'Failed to create payment');
      }
    } catch (err) {
      setError('Failed to create payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle price update
  const handlePriceUpdate = async () => {
    if (!selectedPrescriptionForPrice || !newPrice) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setActionLoading(true);
      const price = parseFloat(newPrice);
      
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid positive number');
        return;
      }

      const response = await fetch(`/api/admin/prescriptions/${selectedPrescriptionForPrice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ amount: price })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the prescriptions list
        fetchPrescriptions(pagination?.currentPage || 1);
        setIsPriceModalOpen(false);
        setSelectedPrescriptionForPrice(null);
        setNewPrice('');
        setError('');
      } else {
        setError(data.message || 'Failed to update price');
      }
    } catch (err) {
      setError('Failed to update price');
    } finally {
      setActionLoading(false);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !user) {
    return <div className="p-8">Loading...</div>;
  }

  if (user.role !== 'admin') {
    return <div className="p-8">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescription Management</h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by customer name, email, or medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">All Status</option>
              <option value="pending">Unapproved</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="ready_to_ship">Ready to Ship</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading prescriptions...</td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No prescriptions found</td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{prescription.user.name}</div>
                        <div className="text-sm text-gray-500">{prescription.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{prescription.medicine}</div>
                      <div className="text-sm text-gray-500">Qty: {prescription.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      £{prescription.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(prescription.status)}`}>
                        {prescription.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(prescription.paymentStatus)}`}>
                        {prescription.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View/Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescriptionForPrice(prescription);
                            setNewPrice(prescription.amount.toString());
                            setIsPriceModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Update Price
                        </button>
                        {prescription.status === 'approved' && prescription.paymentStatus === 'unpaid' && (
                          <button
                            onClick={() => handleCreatePayment(prescription.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Create Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchPrescriptions(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPrescriptions(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                  {' '}({pagination.totalPrescriptions} total prescriptions)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchPrescriptions(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchPrescriptions(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {isModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Prescription Details - {selectedPrescription.medicine}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedPrescription.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900">£{selectedPrescription.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescription Details</label>
                  <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900">
                      {selectedPrescription.prescriptionText}
                    </pre>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                  <p className="text-sm text-gray-900">{selectedPrescription.deliveryAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedPrescription.status)}`}>
                      {selectedPrescription.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedPrescription.paymentStatus)}`}>
                      {selectedPrescription.paymentStatus}
                    </span>
                  </div>
                </div>

                {selectedPrescription.trackingNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.trackingNumber}</p>
                  </div>
                )}

                {selectedPrescription.courierName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Courier Service</label>
                    <p className="text-sm text-gray-900">{selectedPrescription.courierName}</p>
                  </div>
                )}

                {/* Status Update Section */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Update Status</h4>
                  
                  <div className="space-y-3">
                    {selectedPrescription.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(selectedPrescription.id, 'approved')}
                          disabled={actionLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason) {
                              setRejectionReason(reason);
                              handleStatusChange(selectedPrescription.id, 'rejected');
                            }
                          }}
                          disabled={actionLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {selectedPrescription.status === 'approved' && selectedPrescription.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => handleCreatePayment(selectedPrescription.id)}
                        disabled={actionLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send Bill to Customer
                      </button>
                    )}

                    {(selectedPrescription.status === 'paid' || selectedPrescription.paymentStatus === 'paid') && (
                      <button
                        onClick={() => handleStatusChange(selectedPrescription.id, 'ready_to_ship')}
                        disabled={actionLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Mark Ready to Ship
                      </button>
                    )}

                    {selectedPrescription.status === 'ready_to_ship' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter courier service name"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                        <input
                          type="text"
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                        <button
                          onClick={() => handleStatusChange(selectedPrescription.id, 'dispatched')}
                          disabled={actionLoading || !trackingNumber}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                          Mark as Dispatched
                        </button>
                      </div>
                    )}

                    {selectedPrescription.status === 'dispatched' && (
                      <button
                        onClick={() => handleStatusChange(selectedPrescription.id, 'delivered')}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPrescription(null);
                    setTrackingNumber('');
                    setCourierName('');
                    setRejectionReason('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {isPriceModalOpen && selectedPrescriptionForPrice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Update Prescription Price
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Customer:</strong> {selectedPrescriptionForPrice.user.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Medicine:</strong> {selectedPrescriptionForPrice.medicine}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Current Price:</strong> £{selectedPrescriptionForPrice.amount.toFixed(2)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter new price"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsPriceModalOpen(false);
                  setSelectedPrescriptionForPrice(null);
                  setNewPrice('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePriceUpdate}
                disabled={actionLoading || !newPrice}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
