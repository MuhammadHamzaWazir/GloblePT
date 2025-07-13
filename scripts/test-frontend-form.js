const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFormSubmission() {
  try {
    console.log('🔍 Testing Frontend Form Submission Behavior...\n');

    // Step 1: Login to get auth cookies
    console.log('1. Logging in...');
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
    console.log('Set-Cookie header:', setCookieHeader);
    
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    if (!tokenMatch) {
      console.log('❌ No token found in response');
      return;
    }
    
    const customerToken = tokenMatch[1];
    console.log('✅ Login successful');

    // Step 2: Check auth status first (like the frontend does)
    console.log('\n2. Checking auth status...');
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${customerToken}`
      }
    });

    const authData = await authResponse.json();
    console.log('Auth check result:', authData);

    if (!authResponse.ok || !authData.user) {
      console.log('❌ Auth check failed');
      return;
    }

    // Step 3: Submit complaint exactly like frontend
    console.log('\n3. Submitting complaint...');
    
    const formData = new FormData();
    formData.append('title', 'Frontend Test Complaint');
    formData.append('description', 'Testing the exact frontend form submission flow');
    formData.append('category', 'service');
    formData.append('priority', 'medium');

    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const complaintResponse = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${customerToken}`
      },
      body: formData
    });

    console.log('Complaint response status:', complaintResponse.status);
    console.log('Complaint response headers:', Object.fromEntries(complaintResponse.headers.entries()));
    
    const responseText = await complaintResponse.text();
    console.log('Complaint response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('❌ Failed to parse JSON response');
      return;
    }

    if (complaintResponse.ok && responseData.success) {
      console.log('✅ Complaint submitted successfully!');
      console.log('Complaint data:', responseData.data.complaint);
    } else {
      console.log('❌ Complaint submission failed');
      console.log('Error:', responseData.message);
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFormSubmission();
