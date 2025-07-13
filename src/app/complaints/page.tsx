'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'service',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Complaint form submission started');
    console.log('User:', user);
    console.log('Form data:', formData);
    
    if (!user) {
      console.log('❌ User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      console.log('❌ Form validation failed - missing required fields');
      setFieldErrors({
        title: !formData.title.trim() ? 'Title is required' : '',
        description: !formData.description.trim() ? 'Description is required' : ''
      });
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setFieldErrors({});
      
      console.log('📡 Sending complaint to API...');

      // Create FormData to match API expectations
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('description', formData.description.trim());
      submitFormData.append('category', formData.category);
      submitFormData.append('priority', formData.priority);

      console.log('📡 FormData contents:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        credentials: 'include',
        body: submitFormData // Send FormData instead of JSON
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📡 API Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📡 API Response parsed data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        setError('Invalid response from server');
        return;
      }

      if (response.ok && data.success) {
        console.log('✅ Complaint submitted successfully');
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          category: 'service',
          priority: 'medium'
        });
        
        // Show success message briefly, then redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard/complaints?submitted=true');
        }, 2000);
      } else {
        console.log('❌ Complaint submission failed:', data.message);
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setFieldErrors({});
    setSuccess(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please log in to submit a complaint
          </h2>
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
              <p className="mt-2 text-gray-600">
                We value your feedback and take all complaints seriously. Please provide detailed information to help us address your concerns effectively.
              </p>
            </div>

            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Complaint submitted successfully!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      Your complaint has been received and will be reviewed promptly. Redirecting you to your complaints dashboard...
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => router.push('/dashboard/complaints?submitted=true')}
                        className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                      >
                        Go to Dashboard Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error submitting complaint
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief summary of your complaint"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                    fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="service">Service Issue</option>
                  <option value="staff">Staff Behavior</option>
                  <option value="product">Product Quality</option>
                  <option value="delivery">Delivery Problem</option>
                  <option value="billing">Billing Issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="low">Low - General feedback</option>
                  <option value="medium">Medium - Moderate concern</option>
                  <option value="high">High - Serious issue</option>
                  <option value="urgent">Urgent - Immediate attention needed</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please provide a detailed description of your complaint, including when it occurred, who was involved, and what outcome you're seeking..."
                  rows={6}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                    fieldErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  The more details you provide, the better we can address your concerns.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your complaint will be acknowledged and assigned a tracking number</li>
                  <li>• We'll assign it to the appropriate staff member for investigation</li>
                  <li>• You'll receive updates on the status of your complaint</li>
                  <li>• We aim to resolve all complaints within 5-10 business days</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
