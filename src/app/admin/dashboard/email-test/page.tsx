'use client';

import { useState, useEffect } from 'react';

interface EmailTestResult {
  messageId?: string;
  previewUrl?: string;
  recipient?: string;
  sentAt?: string;
  adminEmail?: {
    messageId: string;
    previewUrl?: string;
  };
  customerEmail?: {
    messageId: string;
    previewUrl?: string;
  };
  testData?: any;
}

interface ConfigStatus {
  emailConfigured: boolean;
  environment: string;
  smtpHost: string;
  smtpPort: string;
  hasCredentials: boolean;
  adminEmail: string;
}

export default function EmailTestPage() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');

  // Load config status on component mount
  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      if (data.success) {
        setConfigStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config status:', error);
    }
  };

  const testEmailConfig = async () => {
    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'test-config' })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult({ messageId: 'Config test passed' });
        await fetchConfigStatus(); // Refresh status
      } else {
        setError(data.message || 'Configuration test failed');
      }
    } catch (err) {
      setError('Failed to test configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'send-test',
          email: testEmail,
          name: testName || 'Test User'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data.data);
      } else {
        setError(data.message || 'Failed to send test email');
      }
    } catch (err) {
      setError('Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  const sendContactFormTest = async () => {
    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'send-contact-test',
          email: testEmail || 'test@example.com',
          name: testName || 'Test User'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data.data);
      } else {
        setError(data.message || 'Failed to send contact form test');
      }
    } catch (err) {
      setError('Failed to send contact form test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">📧 Email Server Testing</h1>
              <p className="mt-2 text-gray-600">
                Test the email server configuration and send test emails to verify functionality.
              </p>
            </div>

            {/* Configuration Status */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration Status</h2>
              {configStatus ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${configStatus.emailConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium">Email Server: {configStatus.emailConfigured ? 'Connected' : 'Disconnected'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Environment: {configStatus.environment}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>SMTP Host:</strong> {configStatus.smtpHost}</p>
                      <p className="text-sm"><strong>SMTP Port:</strong> {configStatus.smtpPort}</p>
                      <p className="text-sm"><strong>Has Credentials:</strong> {configStatus.hasCredentials ? 'Yes' : 'No'}</p>
                      <p className="text-sm"><strong>Admin Email:</strong> {configStatus.adminEmail}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600">Loading configuration status...</p>
                </div>
              )}
            </div>

            {/* Test Controls */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Email Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Test Email Address
                    </label>
                    <input
                      type="email"
                      id="testEmail"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
                      Test Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="testName"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="Test User"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Test Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={testEmailConfig}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Testing...' : 'Test Configuration'}
                </button>

                <button
                  onClick={sendTestEmail}
                  disabled={isLoading || !testEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </button>

                <button
                  onClick={sendContactFormTest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Test Contact Form'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Test Results */}
              {testResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Test Results</h3>
                  
                  {testResult.messageId && testResult.messageId !== 'Config test passed' && (
                    <div className="space-y-3">
                      <div>
                        <strong>Message ID:</strong> {testResult.messageId}
                      </div>
                      {testResult.recipient && (
                        <div>
                          <strong>Sent To:</strong> {testResult.recipient}
                        </div>
                      )}
                      {testResult.sentAt && (
                        <div>
                          <strong>Sent At:</strong> {new Date(testResult.sentAt).toLocaleString()}
                        </div>
                      )}
                      {testResult.previewUrl && (
                        <div>
                          <strong>Preview:</strong> 
                          <a 
                            href={testResult.previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            View Email Preview
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {testResult.adminEmail && testResult.customerEmail && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-green-800">Admin Notification Email:</h4>
                        <div className="ml-4 space-y-1">
                          <div>Message ID: {testResult.adminEmail.messageId}</div>
                          {testResult.adminEmail.previewUrl && (
                            <div>
                              <a 
                                href={testResult.adminEmail.previewUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Preview Admin Email
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-green-800">Customer Confirmation Email:</h4>
                        <div className="ml-4 space-y-1">
                          <div>Message ID: {testResult.customerEmail.messageId}</div>
                          {testResult.customerEmail.previewUrl && (
                            <div>
                              <a 
                                href={testResult.customerEmail.previewUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Preview Customer Email
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {testResult.testData && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-green-800">Test Data Used:</h4>
                          <div className="ml-4 space-y-1 text-sm">
                            <div>Name: {testResult.testData.name}</div>
                            <div>Email: {testResult.testData.email}</div>
                            <div>Message: {testResult.testData.message.substring(0, 100)}...</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {testResult.messageId === 'Config test passed' && (
                    <div className="text-green-700">
                      ✅ Email configuration test passed successfully!
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Testing Instructions</h3>
                <ul className="space-y-2 text-blue-800">
                  <li><strong>Test Configuration:</strong> Verifies that the email server settings are correct and can connect.</li>
                  <li><strong>Send Test Email:</strong> Sends a simple test email to the specified address to verify delivery.</li>
                  <li><strong>Test Contact Form:</strong> Tests the complete contact form email workflow (admin notification + customer confirmation).</li>
                  <li><strong>Preview URLs:</strong> In development mode, you can preview emails using the Ethereal Email service links.</li>
                </ul>
              </div>

              {/* Environment Setup Guide */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚙️ Environment Configuration</h3>
                <p className="text-yellow-800 mb-3">
                  To configure your own SMTP server, add these environment variables to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:
                </p>
                <pre className="bg-yellow-100 p-3 rounded text-sm text-yellow-900 overflow-x-auto">
{`SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@your-domain.com
SMTP_FROM="Your Company Name <noreply@your-domain.com>"`}
                </pre>
                <p className="text-yellow-800 mt-3 text-sm">
                  Popular SMTP providers: Gmail (smtp.gmail.com:587), SendGrid (smtp.sendgrid.net:587), Amazon SES, Mailgun
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
