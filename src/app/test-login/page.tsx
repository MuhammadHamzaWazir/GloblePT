'use client';

import { useState } from 'react';

export default function LoginTestPage() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('12345678');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Login successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerify = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Verify successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Verify failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Login API Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={testVerify}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Verify'}
            </button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-900">Test Credentials:</h3>
          <p className="text-blue-700 text-sm">Email: test@test.com</p>
          <p className="text-blue-700 text-sm">Password: 12345678</p>
        </div>
      </div>
    </div>
  );
}
