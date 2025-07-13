const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🧪 Testing Login API');
  console.log('=' .repeat(50));
  
  try {
    const testUsers = [
      { email: 'admin@globalpharmatrading.co.uk', password: 'Admin@2024', role: 'admin' },
      { email: 'pharmacist@globalpharmatrading.co.uk', password: 'Pharmacist@2024', role: 'staff' },
      { email: 'customer1@mailinator.com', password: 'Customer@2024', role: 'user' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n📋 Testing login for ${testUser.role} (${testUser.email})...`);
      
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const responseText = await loginResponse.text();
      console.log(`Status: ${loginResponse.status}`);
      console.log(`Response: ${responseText}`);
      
      if (loginResponse.ok) {
        console.log(`✅ Login successful for ${testUser.role}`);
        const cookies = loginResponse.headers.get('set-cookie');
        console.log(`Cookies: ${cookies}`);
      } else {
        console.log(`❌ Login failed for ${testUser.role}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during login test:', error);
  }
}

testLogin();
