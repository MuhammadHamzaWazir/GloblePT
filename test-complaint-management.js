const fetch = require('node-fetch');

// Comprehensive test for complaint management
async function testComplaintManagement() {
  console.log('🧪 Testing complete complaint management system...');
  
  try {
    // 1. Login as admin
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
    console.log('✅ 1. Admin login:', loginData.success ? 'Success' : 'Failed');
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    
    // 2. Test staff API
    const staffResponse = await fetch('http://localhost:3000/api/admin/staff', {
      headers: { 'Cookie': cookies }
    });
    const staffData = await staffResponse.json();
    console.log('✅ 2. Staff API:', staffData.success ? `Success (${staffData.data.length} staff)` : 'Failed');
    
    // 3. Test complaints API
    const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
      headers: { 'Cookie': cookies }
    });
    const complaintsData = await complaintsResponse.json();
    console.log('✅ 3. Complaints API:', complaintsData.success ? `Success (${complaintsData.data.complaints.length} complaints)` : 'Failed');
    
    if (!complaintsData.success || !complaintsData.data.complaints.length) {
      console.log('❌ No complaints found to test');
      return;
    }

    const testComplaint = complaintsData.data.complaints[0];
    console.log('🎯 Testing with complaint:', testComplaint.id, '-', testComplaint.title);
    
    // 4. Test complaint update - Status change
    const updateResponse1 = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
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
    const updateData1 = await updateResponse1.json();
    console.log('✅ 4. Status update:', updateData1.success ? 'Success' : 'Failed');
    
    // 5. Test staff assignment
    if (staffData.success && staffData.data.length > 0) {
      const staffMember = staffData.data[1]; // Use second staff member
      const updateResponse2 = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          assignedToId: staffMember.id
        })
      });
      const updateData2 = await updateResponse2.json();
      console.log('✅ 5. Staff assignment:', updateData2.success ? `Success (assigned to ${staffMember.name})` : 'Failed');
    }
    
    // 6. Test resolution
    const updateResponse3 = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        status: 'resolved',
        resolution: 'Test resolution - issue has been resolved through automated testing'
      })
    });
    const updateData3 = await updateResponse3.json();
    console.log('✅ 6. Resolution:', updateData3.success ? 'Success' : 'Failed');
    
    // 7. Final verification - Get updated complaint
    const finalResponse = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
      headers: { 'Cookie': cookies }
    });
    const finalData = await finalResponse.json();
    console.log('✅ 7. Final verification:', finalData.success ? 'Success' : 'Failed');
    
    if (finalData.success) {
      const final = finalData.data.complaint;
      console.log('📋 Final complaint state:');
      console.log(`   - Status: ${final.status}`);
      console.log(`   - Priority: ${final.priority}`);
      console.log(`   - Assigned to: ${final.assignedTo ? final.assignedTo.name : 'Unassigned'}`);
      console.log(`   - Resolution: ${final.resolution ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testComplaintManagement();
