'use client';

import { useState } from 'react';
import { getDashboardRoute } from '@/lib/utils';

export default function RoleTestPage() {
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loginResult, setLoginResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCredentials = {
    admin: { email: 'admin@test.com', password: '12345678' },
    staff: { email: 'staff@test.com', password: '12345678' },
    assistant: { email: 'assistant@test.com', password: '12345678' },
    customer: { email: 'customer@test.com', password: '12345678' }
  };

  const testRoleRedirect = async () => {
    setLoading(true);
    setLoginResult('');
    
    try {
      const credentials = testCredentials[selectedRole as keyof typeof testCredentials];
      const expectedRoute = getDashboardRoute(selectedRole);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (response.ok) {
        setLoginResult(`✅ Login successful for ${selectedRole.toUpperCase()}
📍 Expected redirect: ${expectedRoute}
👤 User data: ${JSON.stringify(data.user, null, 2)}

🔄 You should be redirected automatically...`);
        
        // Simulate the redirect that would happen in the login page
        setTimeout(() => {
          window.location.href = expectedRoute;
        }, 2000);
        
      } else {
        setLoginResult(`❌ Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setLoginResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const logoutTest = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setLoginResult('🚪 Logged out successfully');
    } catch (error) {
      setLoginResult(`❌ Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Role-Based Dashboard Redirect Test</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Role Redirection</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Role to Test</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="assistant">Assistant</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900">Test Credentials:</h3>
              <p className="text-sm text-gray-600">
                Email: {testCredentials[selectedRole as keyof typeof testCredentials].email}
              </p>
              <p className="text-sm text-gray-600">
                Password: {testCredentials[selectedRole as keyof typeof testCredentials].password}
              </p>
              <p className="text-sm text-gray-600">
                Expected redirect: <code className="bg-gray-200 px-1 rounded">{getDashboardRoute(selectedRole)}</code>
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={testRoleRedirect}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : `Test ${selectedRole.toUpperCase()} Login`}
              </button>
              
              <button
                onClick={logoutTest}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Expected Routes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dashboard Routes</h2>
            <div className="space-y-2">
              <div className="bg-red-50 p-3 rounded-md">
                <strong>Admin:</strong> <code>/admin/dashboard</code>
                <p className="text-sm text-gray-600">Full system access</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <strong>Staff:</strong> <code>/staff-dashboard</code>
                <p className="text-sm text-gray-600">Staff management features</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <strong>Assistant:</strong> <code>/assistant-portal</code>
                <p className="text-sm text-gray-600">Assistant portal access</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md">
                <strong>Customer:</strong> <code>/dashboard</code>
                <p className="text-sm text-gray-600">Customer dashboard</p>
              </div>
            </div>
          </div>
        </div>
        
        {loginResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{loginResult}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-900">How it works:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>User logs in with their credentials</li>
            <li>API verifies credentials and returns user data with role</li>
            <li>Frontend gets the user role and calculates appropriate dashboard route</li>
            <li>User is redirected to their role-specific dashboard</li>
            <li>Middleware protects routes based on user role</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
