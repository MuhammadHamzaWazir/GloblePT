const fetch = require('node-fetch');

// Test staff assignment functionality
async function testStaffAssignment() {
  console.log('🧪 Testing staff assignment...');
  
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
    
    // Get staff members
    const staffResponse = await fetch('http://localhost:3000/api/admin/users?role=staff', {
      headers: {
        'Cookie': cookies
      }
    });

    const staffData = await staffResponse.json();
    console.log('Staff response:', staffData);
    
    if (!staffData.success || !staffData.data?.users?.length) {
      console.log('❌ No staff found');
      return;
    }

    const firstStaff = staffData.data.users[0];
    console.log('First staff member:', firstStaff);
    
    // Convert to staff format for assignment
    const staffId = firstStaff.staffRecord?.id || firstStaff.id;
    
    // Test assigning staff to complaint - use staff ID 5 (Dr. Sarah Johnson)
    const updateResponse = await fetch(`http://localhost:3000/api/admin/complaints/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        assignedToId: 5
      })
    });

    const updateData = await updateResponse.json();
    console.log('Staff assignment response:', updateData);
    
    if (updateData.success) {
      console.log('✅ Staff assigned successfully!');
    } else {
      console.log('❌ Staff assignment failed:', updateData.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testStaffAssignment();
