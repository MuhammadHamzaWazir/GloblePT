const fetch = require('node-fetch');

// Test staff complaint update
async function testStaffComplaintUpdate() {
  console.log('🧪 Testing staff complaint update...');
  
  try {
    // Login as staff
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'pharmacist@globalpharmatrading.co.uk',
        password: 'staff123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test updating complaint ID 3
    const updateResponse = await fetch('http://localhost:3000/api/staff/complaints/3', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        status: 'resolved',
        resolution: 'Contacted delivery team and ensured faster delivery process is implemented. Customer will receive future deliveries on time.'
      })
    });

    const updateData = await updateResponse.json();
    console.log('Update response:', updateData);
    
    if (updateData.success) {
      console.log('✅ Staff complaint update successful!');
    } else {
      console.log('❌ Staff complaint update failed:', updateData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testStaffComplaintUpdate();
