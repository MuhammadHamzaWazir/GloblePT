'use client';

import React, { useState, useEffect } from 'react';

interface SecuritySettingsProps {
  userEmail: string;
}

export default function SecuritySettings({ userEmail }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });

      if (response.ok) {
        const data = await response.json();
        setTwoFactorEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const generateTwoFactor = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
        setBackupCodes(data.backupCodes);
        setShowSetup(true);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to generate 2FA setup');
      }
    } catch (error) {
      setError('Failed to generate 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'verify', 
          token: verificationToken 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setTwoFactorEnabled(true);
        setShowSetup(false);
        setVerificationToken('');
      } else {
        const error = await response.json();
        setError(error.message || 'Verification failed');
      }
    } catch (error) {
      setError('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setTwoFactorEnabled(false);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Security Settings</h3>
      
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

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account with 2FA
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  twoFactorEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
            </div>
            
            <div>
              {twoFactorEnabled ? (
                <button
                  onClick={disableTwoFactor}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Disable'}
                </button>
              ) : (
                <button
                  onClick={generateTwoFactor}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </div>

          {/* 2FA Setup Modal */}
          {showSetup && setupData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">Setup Two-Factor Authentication</h5>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-medium text-gray-900 mb-2">Setup Instructions:</h6>
                  <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                    {setupData.setupInstructions.instructions.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key (enter this in your authenticator app):
                  </label>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                    {setupData.secret}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code from your authenticator app:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    />
                    <button
                      onClick={verifyAndEnable}
                      disabled={isLoading || verificationToken.length !== 6}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Backup Codes */}
                <div>
                  <h6 className="font-medium text-gray-900 mb-2">⚠️ Backup Codes</h6>
                  <p className="text-sm text-gray-600 mb-2">
                    Save these backup codes in a secure location. You can use them to access your account if you lose your phone.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    Each backup code can only be used once. Store them securely!
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowSetup(false);
                      setSetupData(null);
                      setVerificationToken('');
                      setError('');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Security Info */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Security Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use a strong, unique password for your account</li>
            <li>• Enable two-factor authentication for better security</li>
            <li>• Keep your contact information up to date</li>
            <li>• Log out from shared or public computers</li>
            <li>• Report any suspicious activity immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
