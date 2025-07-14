const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔍 Testing login API...');
  
  try {
    const response = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

testLogin();
