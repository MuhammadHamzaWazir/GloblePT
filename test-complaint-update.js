const fetch = require('node-fetch');

// Test complaint update functionality
async function testComplaintUpdate() {
  console.log('🧪 Testing complaint update...');
  
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
    console.log('Cookies received:', cookies);
    
    // Get complaints first
    const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
      headers: {
        'Cookie': cookies
      }
    });

    const complaintsData = await complaintsResponse.json();
    console.log('Complaints fetched:', complaintsData);
    
    if (!complaintsData.success || !complaintsData.data?.complaints?.length) {
      console.log('❌ No complaints found to update');
      return;
    }

    const firstComplaint = complaintsData.data.complaints[0];
    console.log('First complaint:', firstComplaint);
    
    // Test updating the first complaint
    const updateResponse = await fetch(`http://localhost:3000/api/admin/complaints/${firstComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        status: 'investigating',
        priority: 'high'
      })
    });

    const updateData = await updateResponse.json();
    console.log('Update response:', updateData);
    
    if (updateData.success) {
      console.log('✅ Complaint updated successfully!');
    } else {
      console.log('❌ Update failed:', updateData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testComplaintUpdate();
