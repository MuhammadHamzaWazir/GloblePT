'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  dateOfBirth: string | null;
  photoIdUrl: string | null;
  addressProofUrl: string | null;
  createdAt: string;
  identityVerified: boolean;
  ageVerified: boolean;
}

export default function PendingUsersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <PendingUsersContent />
    </AuthGuard>
  );
}

function PendingUsersContent() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  // Get auth token from cookies
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('pharmacy_auth='));
    return authCookie ? authCookie.split('=')[1] : null;
  };

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch('/api/admin/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch pending users');
      }
    } catch (err: any) {
      setError('Error fetching pending users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    if (!confirm('Are you sure you want to approve this user?')) return;
    
    try {
      setProcessing(userId);
      const token = getAuthToken();
      
      const response = await fetch('/api/admin/pending-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          action: 'approve'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove approved user from pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        alert('User approved successfully!');
      } else {
        setError(data.message || 'Failed to approve user');
      }
    } catch (err: any) {
      setError('Error approving user: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setProcessing(userId);
      const token = getAuthToken();
      
      const response = await fetch('/api/admin/pending-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          action: 'reject',
          rejectionReason: rejectionReason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove rejected user from pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setShowRejectModal(null);
        setRejectionReason('');
        alert('User rejected successfully!');
      } else {
        setError(data.message || 'Failed to reject user');
      }
    } catch (err: any) {
      setError('Error rejecting user: ' + err.message);
    } finally {
      setProcessing(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending User Approvals</h1>
        <p className="text-gray-600">Review and approve new user registrations</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading pending users...</span>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
          <h3 className="text-lg font-semibold mb-2">No Pending Users</h3>
          <p>All user registrations have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* User Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{user.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                    <div><strong>Address:</strong> {user.address}</div>
                    <div><strong>Date of Birth:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                    <div><strong>Registered:</strong> {formatDate(user.createdAt)}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.ageVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.ageVerified ? 'Age Verified' : 'Age Not Verified'}
                    </span>
                  </div>
                </div>

                {/* Documents & Actions */}
                <div>
                  <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <strong>Photo ID:</strong> 
                      {user.photoIdUrl ? (
                        <a 
                          href={user.photoIdUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="ml-2 text-gray-500">Not uploaded</span>
                      )}
                    </div>
                    
                    <div>
                      <strong>Address Proof:</strong> 
                      {user.addressProofUrl ? (
                        <a 
                          href={user.addressProofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="ml-2 text-gray-500">Not uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={processing === user.id}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === user.id ? 'Processing...' : 'Approve'}
                    </button>
                    
                    <button
                      onClick={() => setShowRejectModal(user.id)}
                      disabled={processing === user.id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject User Registration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              <button
                onClick={() => showRejectModal && handleReject(showRejectModal)}
                disabled={processing === showRejectModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {processing === showRejectModal ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
