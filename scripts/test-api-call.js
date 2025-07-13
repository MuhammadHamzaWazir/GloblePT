const jwt = require('jsonwebtoken');

// This simulates testing the API endpoint
async function testAPICall() {
  try {
    console.log('🧪 Testing conversation API call...');

    // You would need a valid JWT token for testing
    // For now, let's just check the JWT secret
    const secret = process.env.JWT_SECRET;
    console.log('JWT Secret available:', !!secret);

    // Test data that would be sent to the API
    const testData = {
      subject: 'Test API Message',
      initialMessage: 'This is a test message from the API',
      priority: 'normal'
    };

    console.log('Test data:', testData);
    console.log('✅ API test setup complete');

    console.log('\n📋 To test manually:');
    console.log('1. Login to the application');
    console.log('2. Go to /dashboard/inbox');
    console.log('3. Click "New Message"');
    console.log('4. Fill in subject and message');
    console.log('5. Click "Send Message"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPICall();
