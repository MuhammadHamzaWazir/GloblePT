'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  FaExclamationCircle, 
  FaUser,
  FaCalendar,
  FaComment,
  FaEdit,
  FaCheck
} from 'react-icons/fa';

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  resolution?: string;
}

export default function SupervisorComplaints() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user && !['supervisor', 'admin'].includes(user.role)) {
      router.push('/auth/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && ['supervisor', 'admin'].includes(user.role)) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff/complaints?limit=50', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplaints(data.data.complaints || []);
        }
      } else {
        setError('Failed to load complaints');
      }
    } catch (err) {
      setError('Error loading complaints');
      console.error('Error fetching complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint || !resolution.trim()) {
      alert('Please provide a resolution');
      return;
    }

    try {
      setIsResolving(true);
      
      const response = await fetch(`/api/staff/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'resolved',
          resolution: resolution.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the complaint in the local state
          setComplaints(prev =>
            prev.map(c =>
              c.id === selectedComplaint.id
                ? { ...c, status: 'resolved', resolution: resolution.trim() }
                : c
            )
          );
          
          setSelectedComplaint(null);
          setResolution('');
          
          alert('Complaint resolved successfully!');
        } else {
          alert(data.message || 'Failed to resolve complaint');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to resolve complaint');
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Error resolving complaint');
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <FaExclamationCircle className="text-purple-600" />
          Complaints Management
        </h1>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          <span className="text-purple-800 font-medium">
            {complaints.length} Total
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
            <p className="text-gray-500">There are no complaints to review.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationCircle className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUser />
                      <div>
                        <p className="font-medium">{complaint.user.name}</p>
                        <p className="text-xs">{complaint.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaComment />
                      <div>
                        <p className="font-medium">Category: {complaint.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar />
                      <div>
                        <p className="font-medium">{formatDate(complaint.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Description:</strong> {complaint.description}
                    </p>
                  </div>

                  {complaint.assignedTo && (
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-700">
                        <strong>Assigned to:</strong> {complaint.assignedTo.name} ({complaint.assignedTo.email})
                      </p>
                    </div>
                  )}

                  {complaint.resolution && (
                    <div className="mt-4 p-3 bg-green-50 rounded">
                      <p className="text-sm text-green-700">
                        <strong>Resolution:</strong> {complaint.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setResolution(complaint.resolution || '');
                    }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    <FaCheck />
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Resolve Complaint</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{selectedComplaint.title}</p>
              <p className="text-sm text-gray-600">From: {selectedComplaint.user.name}</p>
              <p className="text-sm text-gray-600 mt-2">{selectedComplaint.description}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution *
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Provide a detailed resolution for this complaint..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setResolution('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveComplaint}
                disabled={isResolving || !resolution.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isResolving ? 'Resolving...' : 'Resolve Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
