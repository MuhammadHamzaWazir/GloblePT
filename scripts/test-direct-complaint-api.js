const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testComplaintAPI() {
  try {
    console.log('🔍 Testing Complaint API directly...\n');

    // Test login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const customerToken = tokenMatch[1];
    console.log('✅ Login successful, token:', customerToken.substring(0, 20) + '...');

    // Create FormData for complaint submission
    const formData = new FormData();
    formData.append('title', 'Test Direct API Complaint');
    formData.append('description', 'Testing complaint submission via direct API call');
    formData.append('category', 'service');
    formData.append('priority', 'medium');

    console.log('📡 Submitting complaint...');

    // Submit complaint
    const complaintResponse = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${customerToken}`
      },
      body: formData
    });

    console.log('Response status:', complaintResponse.status);
    console.log('Response headers:', Object.fromEntries(complaintResponse.headers.entries()));
    
    const responseText = await complaintResponse.text();
    console.log('Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('Failed to parse JSON response');
      return;
    }

    if (complaintResponse.ok && responseData.success) {
      console.log('✅ Complaint submitted successfully!');
      console.log('Complaint ID:', responseData.data.complaint.id);
    } else {
      console.log('❌ Complaint submission failed:', responseData.message);
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testComplaintAPI();
