const fetch = require('node-fetch');

// Test assistant complaints access
async function testAssistantComplaints() {
  console.log('🧪 Testing assistant complaints access...');
  
  try {
    // Login as assistant
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'assistant@globalpharmatrading.co.uk',
        password: 'assistant123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Assistant login:', loginData.success ? 'Success' : 'Failed');
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test the staff complaints endpoint
    const complaintsResponse = await fetch('http://localhost:3000/api/staff/complaints', {
      headers: {
        'Cookie': cookies
      }
    });

    const complaintsData = await complaintsResponse.json();
    console.log('Assistant complaints response:', complaintsData.success ? 'Success' : 'Failed');
    
    if (complaintsData.success) {
      console.log(`✅ Found ${complaintsData.data.complaints.length} assigned complaints for assistant`);
      if (complaintsData.data.complaints.length > 0) {
        console.log('First complaint:', complaintsData.data.complaints[0].title);
      }
    } else {
      console.log('❌ Failed:', complaintsData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAssistantComplaints();
