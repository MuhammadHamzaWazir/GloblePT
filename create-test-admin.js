const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestAdmin() {
  // Use production DATABASE_URL
  process.env.DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
  
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating test admin user...');
    
    // First, delete any existing test admin
    await prisma.user.deleteMany({
      where: { email: 'admin@test.com' }
    });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Admin',
        password: hashedPassword,
        role: 'admin',
        accountStatus: 'approved',
        identityVerified: true,
        address: '123 Admin Street, Admin City'
      }
    });
    
    console.log('✅ Test admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('Status:', admin.accountStatus);
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
