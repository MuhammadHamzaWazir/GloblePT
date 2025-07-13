'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import { FaUpload, FaEye, FaTrash, FaCheck, FaPrescriptionBottleAlt, FaFileDownload, FaClock, FaPills, FaPlus } from 'react-icons/fa';

interface Prescription {
  id: string;
  medicine: string;
  filename: string;
  fileUrl?: string;
  quantity: number;
  amount: number;
  status: string;
  paymentStatus: string;
  medicineType: string;
  uploadedAt: string;
  updatedAt: string;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions/user', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPrescriptions(data.prescriptions || []);
      } else {
        console.error('Failed to fetch prescriptions:', data.message);
        setError('Failed to load prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please upload only image files (JPG, PNG, GIF) or PDF documents.');
      return;
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError('');
    setSelectedFiles(files);

    // Create previews for images
    const newPreviews: string[] = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.filter(f => f.type.startsWith('image/')).length) {
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`prescription_${index}`, file);
      });

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess(data.message || 'Prescription(s) uploaded successfully! Our pharmacists will review them shortly.');
      setSelectedFiles([]);
      setPreviews([]);
      setShowUploadForm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      // Refresh prescriptions list
      fetchPrescriptions();

    } catch (error: any) {
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock className="mr-1" />;
      case 'approved':
      case 'processing':
        return <FaPills className="mr-1" />;
      case 'ready':
      case 'dispatched':
        return <FaUpload className="mr-1" />;
      case 'completed':
      case 'delivered':
        return <FaCheck className="mr-1" />;
      default:
        return <FaPrescriptionBottleAlt className="mr-1" />;
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
            <p className="text-gray-600">Loading your prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">My Prescriptions</h1>
        <p className="text-gray-600">
          Upload new prescriptions and manage your existing prescription orders.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Upload New Prescription
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">📋 Upload New Prescription</h2>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFiles([]);
                setPreviews([]);
                setError('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
            <FaUpload className="mx-auto text-4xl text-green-600 mb-4" />
            <p className="text-lg text-black mb-4">
              Click to select prescription images or PDFs
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="prescription-upload"
            />
            <label
              htmlFor="prescription-upload"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-block transition-colors"
            >
              Select Files
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPG, PNG, GIF, PDF (Max 10MB each)
            </p>
          </div>

          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-black mb-3">Selected Files:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-black truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    {file.type.startsWith('image/') && previews[index] && (
                      <img
                        src={previews[index]}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    
                    {file.type === 'application/pdf' && (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">PDF Document</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setPreviews([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded flex items-center transition-colors"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Prescriptions'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Prescriptions */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-black">Your Prescriptions</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <FaPrescriptionBottleAlt className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No prescriptions uploaded</h3>
            <p className="text-gray-500">
              You haven't uploaded any prescriptions yet. Click "Upload New Prescription" above to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{prescription.medicine}</h3>
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()} • 
                      Quantity: {prescription.quantity} • 
                      Type: {prescription.medicineType}
                    </p>
                    {prescription.filename && prescription.filename !== prescription.medicine && (
                      <p className="text-sm text-blue-600">File: {prescription.filename}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(prescription.status)}`}>
                      {getStatusIcon(prescription.status)}
                      {formatStatus(prescription.status)}
                    </div>
                    {prescription.amount > 0 && (
                      <p className="text-lg font-semibold text-black mt-1">
                        £{prescription.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {prescription.fileUrl && (
                  <div className="mb-4">
                    <a
                      href={prescription.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <FaFileDownload className="mr-1" />
                      View Prescription Document
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Last updated: {new Date(prescription.updatedAt).toLocaleString()} • 
                  Payment: {prescription.paymentStatus}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
