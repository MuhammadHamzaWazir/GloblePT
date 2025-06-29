const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🚀 Creating test users for different roles...');
    
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: '12345678',
        roleId: 1, // admin role
        role: 'ADMIN'
      },
      {
        name: 'Staff User',
        email: 'staff@test.com',
        password: '12345678',
        roleId: 2, // staff role
        role: 'STAFF'
      },
      {
        name: 'Assistant User',
        email: 'assistant@test.com',
        password: '12345678',
        roleId: 4, // assistant role
        role: 'ASSISTANT'
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: '12345678',
        roleId: 3, // customer role
        role: 'CUSTOMER'
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`ℹ️ ${userData.role} user already exists: ${userData.email}`);
        continue;
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          address: `${userData.role} Test Address`,
          roleId: userData.roleId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Created ${userData.role} user: ${userData.email} (ID: ${user.id})`);
    }
    
    console.log('\n📋 Test Credentials Summary:');
    console.log('================================');
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
    console.log('================================');
    
    console.log('\n🎯 Expected Dashboard Redirects:');
    console.log('- Admin: /admin/dashboard');
    console.log('- Staff: /staff-dashboard');
    console.log('- Assistant: /assistant-portal');
    console.log('- Customer: /dashboard');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
