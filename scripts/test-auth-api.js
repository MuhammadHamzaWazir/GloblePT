const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...');

  try {
    // Test login API
    console.log('📝 Testing login...');
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
    console.log('🔍 Login response:', {
      status: loginResponse.status,
      success: loginData.success,
      message: loginData.message
    });

    if (loginResponse.ok && loginData.success) {
      // Extract cookies from response
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('🍪 Login cookies:', cookies ? 'Present' : 'Missing');

      // Test /api/auth/me with cookies
      console.log('👤 Testing /api/auth/me...');
      const meResponse = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Cookie': cookies || ''
        }
      });

      const meData = await meResponse.json();
      console.log('🔍 Auth me response:', {
        status: meResponse.status,
        success: meData.success,
        user: meData.user?.email
      });

      // Test /api/prescriptions/user with cookies
      console.log('💊 Testing /api/prescriptions/user...');
      const prescriptionsResponse = await fetch('http://localhost:3000/api/prescriptions/user', {
        method: 'GET',
        headers: {
          'Cookie': cookies || ''
        }
      });

      const prescriptionsData = await prescriptionsResponse.json();
      console.log('🔍 Prescriptions response:', {
        status: prescriptionsResponse.status,
        success: prescriptionsData.success,
        message: prescriptionsData.message,
        prescriptionsCount: prescriptionsData.prescriptions?.length || 0
      });

    } else {
      console.log('❌ Login failed, cannot test further APIs');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuthFlow();
