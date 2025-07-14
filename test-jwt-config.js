const { PrismaClient } = require('@prisma/client');

// Test JWT_SECRET availability
console.log('🔍 Testing JWT_SECRET environment variable...');
console.log('JWT_SECRET available:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Test the auth utility
async function testJWTAuth() {
  try {
    const jwt = require('jsonwebtoken');
    
    // Test JWT operations
    console.log('\n🔍 Testing JWT operations...');
    
    const testPayload = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    };
    
    // Test token generation
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Token generated successfully');
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    console.log('\n🎉 JWT configuration is working properly!');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

testJWTAuth();
