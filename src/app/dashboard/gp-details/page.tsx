'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import { FaUserMd, FaSave, FaEdit } from 'react-icons/fa';

interface GPDetails {
  gpName: string;
  gpAddress: string;
  gpPhone: string;
  gpEmail: string;
  practiceName: string;
  nhsNumber: string;
}

export default function GPDetailsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <GPDetailsContent />
    </AuthGuard>
  );
}

function GPDetailsContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [gpDetails, setGpDetails] = useState<GPDetails>({
    gpName: '',
    gpAddress: '',
    gpPhone: '',
    gpEmail: '',
    practiceName: '',
    nhsNumber: ''
  });

  const [originalDetails, setOriginalDetails] = useState<GPDetails>({
    gpName: '',
    gpAddress: '',
    gpPhone: '',
    gpEmail: '',
    practiceName: '',
    nhsNumber: ''
  });

  useEffect(() => {
    fetchGPDetails();
    
    // Debug authentication state in browser
    if (typeof window !== 'undefined') {
      console.log('=== GP Details Page Auth Debug ===');
      console.log('Current URL:', window.location.href);
      console.log('All cookies:', document.cookie);
      
      // Check for pharmacy_auth cookie specifically
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('pharmacy_auth='));
      console.log('Auth cookie found:', !!authCookie);
      
      if (authCookie) {
        console.log('Auth cookie value (first 50 chars):', authCookie.split('=')[1].substring(0, 50) + '...');
      }
    }
  }, []);

  const fetchGPDetails = async () => {
    try {
      console.log('=== Fetching GP Details Debug ===');
      console.log('Current user from auth context:', user);
      
      const response = await fetch('/api/user/gp-details', {
        credentials: 'include' // Ensure cookies are sent
      });
      
      console.log('Fetch GP details response status:', response.status);
      console.log('Fetch GP details response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('GP details fetched successfully:', data);
        setGpDetails(data.gpDetails || {
          gpName: '',
          gpAddress: '',
          gpPhone: '',
          gpEmail: '',
          practiceName: '',
          nhsNumber: ''
        });
        setOriginalDetails(data.gpDetails || {
          gpName: '',
          gpAddress: '',
          gpPhone: '',
          gpEmail: '',
          practiceName: '',
          nhsNumber: ''
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch GP details:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch GP details:', error);
    }
  };

  const handleInputChange = (field: keyof GPDetails, value: string) => {
    setGpDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('=== GP Details Save Debug ===');
      console.log('Current user:', user);
      console.log('GP details to save:', gpDetails);
      
      const response = await fetch('/api/user/gp-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(gpDetails)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save GP details');
      }

      setSuccess('GP details saved successfully!');
      setOriginalDetails(gpDetails);
      setIsEditing(false);

    } catch (error: any) {
      console.error('GP Details save error:', error);
      setError(error.message || 'Failed to save GP details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGpDetails(originalDetails);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const validateNHSNumber = (number: string) => {
    // Basic NHS number validation (10 digits)
    const cleanNumber = number.replace(/\s/g, '');
    return /^\d{10}$/.test(cleanNumber);
  };

  const formatNHSNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length === 10) {
      return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6)}`;
    }
    return number;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">GP Details</h1>
        <p className="text-gray-600">
          Manage your General Practitioner information for prescription verification.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaUserMd className="mr-2 text-green-600" />
            Your GP Information
          </h2>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit Details
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GP Name *
            </label>
            <input
              type="text"
              value={gpDetails.gpName}
              onChange={(e) => handleInputChange('gpName', e.target.value)}
              disabled={!isEditing}
              placeholder="Dr. John Smith"
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practice Name *
            </label>
            <input
              type="text"
              value={gpDetails.practiceName}
              onChange={(e) => handleInputChange('practiceName', e.target.value)}
              disabled={!isEditing}
              placeholder="City Medical Centre"
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GP Practice Address *
            </label>
            <textarea
              value={gpDetails.gpAddress}
              onChange={(e) => handleInputChange('gpAddress', e.target.value)}
              disabled={!isEditing}
              placeholder="123 Medical Street, London, SW1A 1AA"
              rows={3}
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GP Practice Phone *
            </label>
            <input
              type="tel"
              value={gpDetails.gpPhone}
              onChange={(e) => handleInputChange('gpPhone', e.target.value)}
              disabled={!isEditing}
              placeholder="020 7946 0958"
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GP Practice Email
            </label>
            <input
              type="email"
              value={gpDetails.gpEmail}
              onChange={(e) => handleInputChange('gpEmail', e.target.value)}
              disabled={!isEditing}
              placeholder="practice@example.nhs.uk"
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NHS Number *
            </label>
            <input
              type="text"
              value={gpDetails.nhsNumber}
              onChange={(e) => {
                const formatted = formatNHSNumber(e.target.value);
                handleInputChange('nhsNumber', formatted);
              }}
              disabled={!isEditing}
              placeholder="480 123 4567"
              maxLength={12} // Including spaces
              className="w-full border-2 border-gray-300 focus:border-green-600 outline-none py-2 px-3 rounded transition-all disabled:bg-gray-100 text-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your 10-digit NHS number (found on NHS correspondence)
            </p>
            {gpDetails.nhsNumber && !validateNHSNumber(gpDetails.nhsNumber) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid 10-digit NHS number
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Why do we need this information?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• GP details help us verify prescription authenticity</li>
            <li>• NHS number ensures accurate patient identification</li>
            <li>• We may contact your GP to confirm prescription details</li>
            <li>• This information is stored securely and used only for prescription services</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
