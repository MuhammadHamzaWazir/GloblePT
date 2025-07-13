const fetch = require('node-fetch');

// Test staff complaints API
async function testStaffComplaints() {
  console.log('🧪 Testing staff complaints API...');
  
  try {
    // First, login as staff
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
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies ? 'Yes' : 'No');
    
    // Test the staff complaints endpoint
    const complaintsResponse = await fetch('http://localhost:3000/api/staff/complaints', {
      headers: {
        'Cookie': cookies
      }
    });

    const complaintsData = await complaintsResponse.json();
    console.log('Staff complaints response:', complaintsData);
    
    if (complaintsData.success) {
      console.log('✅ Staff complaints API working!');
      console.log(`Found ${complaintsData.data.complaints.length} assigned complaints`);
      if (complaintsData.data.complaints.length > 0) {
        console.log('First complaint:', complaintsData.data.complaints[0]);
      }
    } else {
      console.log('❌ Staff complaints API failed:', complaintsData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testStaffComplaints();
