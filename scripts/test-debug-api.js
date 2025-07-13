const fetch = require('node-fetch');

async function testDebugAPI() {
  console.log('🧪 Testing debug prescription API...');

  try {
    // Login first to get a valid cookie
    console.log('📝 Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pharmacy.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Login successful, cookies obtained');

    // Test debug API
    console.log('🔍 Testing debug prescription API...');
    const debugResponse = await fetch('http://localhost:3000/api/prescriptions/debug', {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    });

    const debugData = await debugResponse.json();
    console.log('📊 Debug API Response:', {
      status: debugResponse.status,
      success: debugData.success,
      message: debugData.message,
      prescriptions: debugData.prescriptions?.length || 0,
      debug: debugData.debug
    });

    if (debugData.prescriptions && debugData.prescriptions.length > 0) {
      console.log('📋 Sample prescription:', debugData.prescriptions[0]);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testDebugAPI();
