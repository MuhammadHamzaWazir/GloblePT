const fetch = require('node-fetch');

// Test the new staff API endpoint
async function testStaffAPI() {
  console.log('🧪 Testing staff API...');
  
  try {
    // First, login as admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@globalpharmatrading.co.uk',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test the staff endpoint
    const staffResponse = await fetch('http://localhost:3000/api/admin/staff', {
      headers: {
        'Cookie': cookies
      }
    });

    const staffData = await staffResponse.json();
    console.log('Staff API response:', staffData);
    
    if (staffData.success) {
      console.log('✅ Staff API working correctly!');
      console.log('Staff members:', staffData.data.map(s => `${s.name} (ID: ${s.id})`));
    } else {
      console.log('❌ Staff API failed:', staffData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testStaffAPI();
