const fetch = require('node-fetch');

async function testUserProfileAPI() {
  console.log('🧪 Testing user profile API...');

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

    // Test user profile API
    console.log('👤 Testing user profile API...');
    const profileResponse = await fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    });

    const profileData = await profileResponse.json();
    console.log('📊 Profile API Response:', {
      status: profileResponse.status,
      success: profileData.success,
      message: profileData.message,
      hasData: !!profileData.data
    });

    if (profileData.data) {
      console.log('👤 User profile data:', {
        id: profileData.data.id,
        name: profileData.data.name,
        email: profileData.data.email,
        address: profileData.data.address,
        role: profileData.data.role,
        addressIsNull: profileData.data.address === null
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testUserProfileAPI();
