const { PrismaClient } = require('@prisma/client');

async function testProductionDB() {
  console.log('Testing production database connectivity...');
  
  // Use production environment variables
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  
  // Set production DATABASE_URL if needed
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
  }
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('🔍 Attempting database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    // Test basic connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    // Test user table
    console.log('🔍 Testing user table access...');
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    // Test if we can find any admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true
      }
    });
    console.log('✅ Admin users found:', adminUsers.length);
    
    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found. This might be why login is failing.');
      
      // Create a test admin user
      console.log('🔧 Creating test admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@pharmacy.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin',
          accountStatus: 'approved',
          identityVerified: true
        }
      });
      console.log('✅ Test admin user created:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
    process.env.NODE_ENV = originalEnv;
  }
}

testProductionDB();
