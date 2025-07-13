const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testApprovalAPI() {
  console.log('🧪 Testing Staff/Admin Approval API Endpoints');
  console.log('=' .repeat(50));
  
  try {
    // Test users
    const testUsers = [
      { email: 'admin@globalpharmatrading.co.uk', password: 'Admin@2024', role: 'admin' },
      { email: 'pharmacist@globalpharmatrading.co.uk', password: 'Pharmacist@2024', role: 'staff' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n📋 Testing ${testUser.role} approval (${testUser.email})...`);
      
      // 1. Login
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (!loginResponse.ok) {
        console.error(`❌ Login failed for ${testUser.email}`);
        continue;
      }
      
      const cookies = loginResponse.headers.get('set-cookie');
      const authCookie = cookies?.split(';')[0];
      
      console.log(`✅ Logged in as ${testUser.role}`);
      
      // 2. Create a test prescription using admin user (since customer requires 2FA)
      const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          medicine: `Test Medicine for ${testUser.role}`,
          dosage: '1 tablet daily',
          quantity: 10,
          amount: 19.99,
          deliveryAddress: '123 Test Street, Test City, TC1 2TC'
        })
      });
      
      const prescription = await prescriptionResponse.json();
      console.log(`✅ Created test prescription ${prescription.id}`);
      
      // 3. Test approval with current user
      const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          action: 'approve'
        })
      });
      
      if (approvalResponse.ok) {
        const approvalResult = await approvalResponse.json();
        console.log(`✅ ${testUser.role} successfully approved prescription ${prescription.id}`);
        console.log(`   Status: ${approvalResult.prescription.status}`);
      } else {
        const error = await approvalResponse.json();
        console.error(`❌ ${testUser.role} approval failed:`, error);
      }
      
      // 4. Clean up
      await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie }
      });
      
      console.log(`🧹 Cleaned up test prescription ${prescription.id}`);
    }
    
    console.log('\n🎉 API approval tests completed!');
    
  } catch (error) {
    console.error('❌ Error during API approval test:', error);
  }
}

// Only run if we're not in a dev server environment
console.log('🚀 Starting API approval tests...');
testApprovalAPI();

module.exports = testApprovalAPI;
