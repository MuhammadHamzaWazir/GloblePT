'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  photoIdUrl: string;
  addressProofUrl: string;
  createdAt: string;
  identityVerified: boolean;
  ageVerified: boolean;
}

export default function PendingUsersPage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      console.log('🔍 Fetching pending users...');
      const response = await fetch('/api/admin/pending-users', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('🔍 Response status:', response.status);
      const data = await response.json();
      console.log('🔍 Response data:', data);
      
      if (response.ok && data.success) {
        setPendingUsers(data.users || []);
        setError('');
      } else {
        setError(data.message || `Failed to fetch pending users (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('❌ Network error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/pending-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove the user from the pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setShowModal(false);
        setSelectedUser(null);
        setRejectionReason('');
        alert(`User ${action}d successfully!`);
      } else {
        alert(data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const openUserModal = (user: PendingUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRejectionReason('');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending User Approvals</h1>
        <p className="text-gray-600">Review and approve new user registrations</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading pending users...</span>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No pending user approvals</div>
          <p className="text-gray-400 mt-2">All users have been processed</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{user.phone}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{user.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {user.photoIdUrl && (
                          <a
                            href={user.photoIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs bg-blue-100 px-2 py-1 rounded"
                          >
                            📷 Photo ID
                          </a>
                        )}
                        {user.addressProofUrl && (
                          <a
                            href={user.addressProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                          >
                            📄 Address Proof
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openUserModal(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for user review */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Review User: {selectedUser.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Phone:</strong> {selectedUser.phone}</div>
                  <div><strong>Address:</strong> {selectedUser.address}</div>
                  <div><strong>Date of Birth:</strong> {new Date(selectedUser.dateOfBirth).toLocaleDateString()}</div>
                  <div><strong>Registration Date:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                <div className="space-y-4">
                  {selectedUser.photoIdUrl && (
                    <div>
                      <div className="text-sm font-medium mb-2">Photo ID:</div>
                      <div className="border rounded-lg p-2">
                        <img
                          src={selectedUser.photoIdUrl}
                          alt="Photo ID"
                          className="max-w-full h-48 object-contain mx-auto"
                          onError={(e) => {
                            // If image fails to load, show a link instead
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `<a href="${selectedUser.photoIdUrl}" target="_blank" class="text-blue-600 hover:text-blue-800">📷 View Photo ID Document</a>`;
                            }
                          }}
                        />
                        <a
                          href={selectedUser.photoIdUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedUser.addressProofUrl && (
                    <div>
                      <div className="text-sm font-medium mb-2">Address Proof:</div>
                      <div className="border rounded-lg p-2">
                        <img
                          src={selectedUser.addressProofUrl}
                          alt="Address Proof"
                          className="max-w-full h-48 object-contain mx-auto"
                          onError={(e) => {
                            // If image fails to load, show a link instead
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `<a href="${selectedUser.addressProofUrl}" target="_blank" class="text-blue-600 hover:text-blue-800">📄 View Address Proof Document</a>`;
                            }
                          }}
                        />
                        <a
                          href={selectedUser.addressProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={3}
                  placeholder="Enter reason for rejection (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUserAction(selectedUser.id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleUserAction(selectedUser.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
