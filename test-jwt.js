// Test JWT token generation
const { generateToken } = require('./src/lib/auth.ts');

async function testJWT() {
  try {
    console.log('Testing JWT token generation...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    
    if (process.env.JWT_SECRET) {
      console.log('JWT_SECRET preview:', process.env.JWT_SECRET.substring(0, 10) + '...');
    }
    
    const testUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'customer'
    };
    
    const token = generateToken(testUser);
    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

testJWT();
