const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Simulate cookie token (you'll need to get this from browser dev tools)
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    console.log('🔐 JWT_SECRET available:', JWT_SECRET ? 'Yes' : 'No');
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (adminUser) {
      console.log('👤 Admin user found:', adminUser.name, '(' + adminUser.email + ')');
      
      // Generate token for testing
      const testToken = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('🎫 Test token generated');
      console.log('📋 To test manually, set this cookie in browser:');
      console.log('   Name: pharmacy_auth');
      console.log('   Value:', testToken.substring(0, 20) + '...');
      
      // Verify token works
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('✅ Token verification successful:', decoded.name, '(' + decoded.role + ')');
      
    } else {
      console.log('❌ No admin user found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
