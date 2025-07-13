const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testActualFormSubmission() {
  console.log('🔍 Testing Actual Form Submission Flow...\n');

  try {
    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: {
        email: 'admin@globalpharmatrading.co.uk'
      }
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`👤 Using test user: ${testUser.name} (ID: ${testUser.id})`);

    // Create a valid JWT token for testing
    const token = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated test token');

    // Test form data in the exact format the frontend sends
    const testFormData = {
      medicines: [
        {
          name: 'Test Medicine A',
          dosage: '500mg',
          quantity: 2,
          instructions: 'Take with food'
        },
        {
          name: 'Test Medicine B',
          dosage: '200mg',
          quantity: 1,
          instructions: 'Take after meals'
        }
      ],
      doctorName: 'Dr. Test Doctor',
      doctorContact: '+44 1234 567890',
      deliveryAddress: testUser.address || '123 Test Street',
      urgency: 'normal',
      notes: 'Test prescription submission'
    };

    console.log('📋 Test form data:');
    console.log(JSON.stringify(testFormData, null, 2));

    // Test the submit API
    console.log('\n🧪 Testing /api/prescriptions/submit...');
    
    const response = await fetch('http://localhost:3000/api/prescriptions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${token}`
      },
      body: JSON.stringify(testFormData)
    });

    const responseText = await response.text();
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`📄 Response Body: ${responseText}`);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('✅ Response parsed as JSON:', responseData);
    } catch (e) {
      console.log('❌ Response is not valid JSON');
    }

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
      
      // Let's also check if the API endpoint exists by testing a simple GET
      console.log('\n🔍 Testing if API endpoint exists...');
      try {
        const getResponse = await fetch('http://localhost:3000/api/prescriptions/submit', {
          method: 'GET'
        });
        console.log(`GET /api/prescriptions/submit status: ${getResponse.status}`);
      } catch (e) {
        console.log('❌ API endpoint unreachable:', e.message);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActualFormSubmission();
