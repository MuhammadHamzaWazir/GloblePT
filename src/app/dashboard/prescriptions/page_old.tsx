'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import { FaUpload, FaEye, FaTrash, FaCheck, FaPrescriptionBottleAlt, FaFileDownload, FaClock, FaPills } from 'react-icons/fa';

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
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      // Refresh uploaded prescriptions list
      fetchUploadedPrescriptions();

    } catch (error: any) {
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUploadedPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions/user');
      if (response.ok) {
        const data = await response.json();
        setUploadedPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    }
  };

  React.useEffect(() => {
    fetchUploadedPrescriptions();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Upload Prescription</h1>
        <p className="text-gray-600">
          Upload clear images or scanned copies of your prescriptions. Our pharmacists will review and process them.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">📋 New Prescription Upload</h2>
        
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
                      <span className="text-gray-500">📄 PDF File</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Upload Prescriptions
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
      </div>

      {/* Previously Uploaded Prescriptions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Your Uploaded Prescriptions</h2>
        
        {uploadedPrescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No prescriptions uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadedPrescriptions.map((prescription) => (
              <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{prescription.filename}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded: {prescription.uploadedAt.toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    prescription.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {prescription.status === 'pending' ? '⏳ Pending Review' :
                     prescription.status === 'processing' ? '🔄 Processing' :
                     '✅ Completed'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(prescription.url, '_blank')}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="View prescription"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
