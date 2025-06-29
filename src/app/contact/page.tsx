'use client';

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailPreviews, setEmailPreviews] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setEmailPreviews(data.data.emailStatus);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
      <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in-delay">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4 animate-pop-in text-center">Contact Us</h1>
        
        {submitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 animate-bounce-in">
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">Message Sent Successfully!</h2>
              <p className="text-green-700 mb-6">
                Thank you for reaching out! We have received your message and will get back to you as soon as possible.
                You should also receive a confirmation email shortly.
              </p>
              
              {emailPreviews && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Email Status:</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      Admin Notification: {emailPreviews.adminSent ? '✅ Sent' : '❌ Failed'}
                      {emailPreviews.adminPreview && (
                        <a 
                          href={emailPreviews.adminPreview} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          Preview
                        </a>
                      )}
                    </p>
                    <p>
                      Confirmation Email: {emailPreviews.customerSent ? '✅ Sent' : '❌ Failed'}
                      {emailPreviews.customerPreview && (
                        <a 
                          href={emailPreviews.customerPreview} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          Preview
                        </a>
                      )}
                    </p>
                    {emailPreviews.error && (
                      <p className="text-red-600">Error: {emailPreviews.error}</p>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmailPreviews(null);
                }}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full font-semibold transition-all"
              >
                Send Another Message
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in-delay">
            <div className="mb-6">
              <p className="text-gray-600 text-center">
                We'd love to hear from you! Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded-lg transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded-lg transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded-lg transition-all"
                  rows={6}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold text-lg shadow transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Message...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-700">Phone</div>
                  <div className="text-gray-600">+44 123 456 7890</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Email</div>
                  <div className="text-gray-600">info@globalpharmacy.com</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Address</div>
                  <div className="text-gray-600">123 Pharmacy Street<br />London, UK</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
