// Test auth functions locally
async function testAuth() {
  console.log('🔍 Testing auth functions...');
  
  try {
    // Test environment variables
    console.log('\n📊 Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('VERCEL:', !!process.env.VERCEL);
    
    // Import auth functions
    const { generateToken, verifyToken } = await import('./src/lib/auth.ts');
    
    console.log('\n🔐 Testing JWT Generation...');
    
    const testUser = {
      id: "11",
      email: "admin@test.com",
      name: "Test Admin",
      role: "admin"
    };
    
    console.log('Test user:', testUser);
    
    // Test token generation
    const token = generateToken(testUser);
    console.log('✅ Token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Test token verification
    const decoded = verifyToken(token);
    console.log('✅ Token verified successfully');
    console.log('Decoded user:', decoded);
    
    // Test with invalid token
    const invalidDecoded = verifyToken('invalid.token.here');
    console.log('❌ Invalid token result:', invalidDecoded);
    
  } catch (error) {
    console.error('❌ Error in auth test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuth();
