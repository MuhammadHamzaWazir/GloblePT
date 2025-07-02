'use client';

import React, { useState, useEffect } from 'react';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  address: string;
  nationalInsuranceNumber?: string;
  nhsNumber?: string;
  file1Url?: string;
  file2Url?: string;
  createdAt: string;
}

export default function IdentityVerificationPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/identity-verification');
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (userId: number, verified: boolean) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/identity-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verified,
          notes: verificationNotes,
          ageVerified: true, // Assume age verified if identity is verified
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // Remove verified user from list
        setPendingUsers(users => users.filter(u => u.id !== userId));
        setSelectedUser(null);
        setVerificationNotes('');
      } else {
        const error = await response.json();
        alert(error.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Identity Verification Center</h1>
          <p className="text-gray-600 mb-4">
            Review and verify customer identity documents to ensure compliance with UK pharmacy regulations.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Verification Checklist</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check photo ID matches customer name and address</li>
              <li>• Verify government-issued ID is valid and not expired</li>
              <li>• Confirm address proof is recent (within 3 months)</li>
              <li>• Validate National Insurance Number format (if provided)</li>
              <li>• Ensure customer is 16+ years old for pharmacy services</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Verifications ({pendingUsers.length})
                </h2>
              </div>
              
              {pendingUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-lg font-medium">All caught up!</p>
                  <p>No pending identity verifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500 mt-1">{user.address}</p>
                          
                          <div className="flex items-center mt-3 space-x-4">
                            {user.file1Url && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                📷 Photo ID
                              </span>
                            )}
                            {user.file2Url && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                🏠 Address Proof
                              </span>
                            )}
                            {user.nationalInsuranceNumber && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                NI Number
                              </span>
                            )}
                            {user.nhsNumber && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                NHS Number
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Registered</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-6">
              {selectedUser ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Verify: {selectedUser.name}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Details
                      </label>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Address:</strong> {selectedUser.address}</p>
                        {selectedUser.nationalInsuranceNumber && (
                          <p><strong>NI Number:</strong> {selectedUser.nationalInsuranceNumber}</p>
                        )}
                        {selectedUser.nhsNumber && (
                          <p><strong>NHS Number:</strong> {selectedUser.nhsNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uploaded Documents
                      </label>
                      <div className="space-y-2">
                        {selectedUser.file1Url && (
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm text-green-800">📷 Photo ID</span>
                            <button className="text-xs text-green-600 hover:underline">
                              View
                            </button>
                          </div>
                        )}
                        {selectedUser.file2Url && (
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="text-sm text-blue-800">🏠 Address Proof</span>
                            <button className="text-xs text-blue-600 hover:underline">
                              View
                            </button>
                          </div>
                        )}
                        {!selectedUser.file1Url && !selectedUser.file2Url && (
                          <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Notes
                      </label>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add verification notes..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleVerification(selectedUser.id, false)}
                          disabled={isProcessing}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          {isProcessing ? 'Processing...' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleVerification(selectedUser.id, true)}
                          disabled={isProcessing}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Select a user from the list to begin verification</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
