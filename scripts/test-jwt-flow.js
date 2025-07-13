const jwt = require('jsonwebtoken');

// Test JWT verification with the same secret from .env.local
const JWT_SECRET = "4bfe717fb9481bd78ec0287e6edc22c2";

// First, let's create a token like the login API does
function createTestToken(userId) {
  return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Then verify it like the prescriptions API does
function testTokenVerification() {
  console.log('🔐 Testing JWT token creation and verification...');
  
  try {
    // Create token for admin user (ID: 29)
    const token = createTestToken(29);
    console.log('✅ Token created:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    // Test the way the prescriptions API parses it
    const userId = parseInt(decoded.userId || decoded.id);
    console.log('✅ Parsed user ID:', userId);
    
    return { success: true, userId, token };
    
  } catch (error) {
    console.error('❌ JWT error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test the exact flow
async function testPrescriptionsAPIFlow() {
  console.log('🧪 Testing prescriptions API JWT flow...');
  
  const jwtTest = testTokenVerification();
  if (!jwtTest.success) {
    console.log('❌ JWT test failed, stopping');
    return;
  }
  
  // Now test with fetch, simulating the exact cookie that would be sent
  try {
    const response = await fetch('http://localhost:3000/api/prescriptions/user', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtTest.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('🔍 API Response:', {
      status: response.status,
      success: data.success,
      message: data.message,
      prescriptions: data.prescriptions?.length || 0
    });
    
    // If there's an error, let's see the full response
    if (!response.ok) {
      console.log('❌ Full error response:', data);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

// Run both tests
const fetch = require('node-fetch');
testPrescriptionsAPIFlow();
