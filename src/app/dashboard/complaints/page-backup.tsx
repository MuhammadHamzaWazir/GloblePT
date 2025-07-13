'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import { FaExclamationCircle, FaPlus, FaUpload, FaDownload, FaClock, FaCheck, FaFileAlt, FaTimes } from 'react-icons/fa';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
  orderNumber?: string;
  affectedService?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
}

export default function UserComplaintsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ComplaintsContent />
    </AuthGuard>
  );
}

function ComplaintsContent() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [showNewComplaintForm, setShowNewComplaintForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'service',
    priority: 'medium',
    affectedService: '',
    orderId: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
      fetchOrders();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setComplaints(data.complaints || []);
      } else {
        console.error('Failed to fetch complaints:', data.message);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please upload only image files (JPG, PNG, GIF), PDF documents, or text files.');
      return;
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError('');
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitComplaint = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      
      if (formData.affectedService) {
        submitData.append('affectedService', formData.affectedService);
      }
      
      if (formData.orderId) {
        submitData.append('orderId', formData.orderId);
      }

      // Add files
      selectedFiles.forEach((file, index) => {
        submitData.append(`file_${index}`, file);
      });

      const response = await fetch('/api/complaints', {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification('Complaint submitted successfully!');
        setShowNewComplaintForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'service',
          priority: 'medium',
          affectedService: '',
          orderId: ''
        });
        setSelectedFiles([]);
        fetchComplaints();
      } else {
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock className="mr-1" />;
      case 'in_review':
      case 'investigating':
        return <FaFileAlt className="mr-1" />;
      case 'resolved':
      case 'complete':
        return <FaCheck className="mr-1" />;
      default:
        return <FaFileAlt className="mr-1" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Complaints & Feedback</h1>
        <p className="text-gray-600">
          Submit complaints or feedback about our services. We take all feedback seriously and work to resolve issues promptly.
        </p>
      </div>

      {notification && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {notification}
        </div>
      )}

      {/* New Complaint Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowNewComplaintForm(!showNewComplaintForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Submit New Complaint
        </button>
      </div>

      {/* New Complaint Form */}
      {showNewComplaintForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Submit New Complaint</h2>
            <button
              onClick={() => setShowNewComplaintForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="service">Service Issue</option>
                <option value="delivery">Delivery Problem</option>
                <option value="medication">Medication Issue</option>
                <option value="billing">Billing/Payment</option>
                <option value="website">Website/Technical</option>
                <option value="staff">Staff Conduct</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Order (Optional)
              </label>
              <select
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="">Select an order...</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id.toString()}>
                    Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affected Service (Optional)
            </label>
            <input
              type="text"
              value={formData.affectedService}
              onChange={(e) => handleInputChange('affectedService', e.target.value)}
              placeholder="e.g., Prescription Service, Customer Support, Delivery"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide detailed information about your complaint..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="complaint-files"
              />
              <label
                htmlFor="complaint-files"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-2xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload screenshots, documents, or other evidence
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Supported: JPG, PNG, PDF, TXT (Max 10MB each)
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowNewComplaintForm(false)}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitComplaint}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded flex items-center transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Existing Complaints */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Your Complaints</h2>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center">
            <FaExclamationCircle className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No complaints submitted</h3>
            <p className="text-gray-500">
              You haven't submitted any complaints yet. Click "Submit New Complaint" above to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{complaint.title}</h3>
                    <p className="text-sm text-gray-600">
                      {complaint.category.replace('_', ' ').toUpperCase()} • 
                      Priority: {complaint.priority.toUpperCase()} • 
                      Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                    {complaint.orderNumber && (
                      <p className="text-sm text-blue-600">Related to Order #{complaint.orderNumber}</p>
                    )}
                    {complaint.affectedService && (
                      <p className="text-sm text-gray-600">Service: {complaint.affectedService}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {formatStatus(complaint.status)}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{complaint.description}</p>

                {complaint.fileUrl && (
                  <div className="mb-4">
                    <a
                      href={complaint.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <FaDownload className="mr-1" />
                      View Attached Evidence
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Last updated: {new Date(complaint.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
