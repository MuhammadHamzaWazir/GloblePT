const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAssignment() {
  try {
    console.log('🔍 Testing Complaint Assignment...\n');

    // Login as admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pharmacy.com',
        password: 'password123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('Login failed:', errorData);
      return;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.log('No Set-Cookie header found');
      return;
    }
    
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    if (!tokenMatch) {
      console.log('No token found in Set-Cookie header');
      return;
    }
    
    const adminToken = tokenMatch[1];
    console.log('✅ Admin login successful');

    // Get a test complaint
    const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${adminToken}`
      }
    });

    const complaintsData = await complaintsResponse.json();
    const complaints = complaintsData.data?.complaints || [];
    const testComplaint = complaints[0];

    console.log('Testing with complaint:', testComplaint.id, testComplaint.title);

    // Try simple status update first
    console.log('\n1. Testing simple status update...');
    const statusUpdateResponse = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${adminToken}`
      },
      body: JSON.stringify({
        status: 'investigating'
      })
    });

    console.log('Status update response:', statusUpdateResponse.status);
    const statusResult = await statusUpdateResponse.json();
    console.log('Status result:', statusResult);

    // Try assignment
    console.log('\n2. Testing staff assignment...');
    const assignmentResponse = await fetch(`http://localhost:3000/api/admin/complaints/${testComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${adminToken}`
      },
      body: JSON.stringify({
        assignedToId: 2  // Dr. Sarah Johnson's ID in the new database
      })
    });

    console.log('Assignment response:', assignmentResponse.status);
    const assignmentResult = await assignmentResponse.json();
    console.log('Assignment result:', assignmentResult);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAssignment();
