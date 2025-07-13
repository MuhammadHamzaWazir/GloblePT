const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSimpleTestUser() {
  console.log('👤 Creating Simple Test User...\n');

  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@pharmacy.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: test@pharmacy.com`);
      console.log(`   Password: password123`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      return existingUser;
    }

    // Create password hash
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test user with minimal required fields
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Pharmacy User',
        email: 'test@pharmacy.com',
        password: hashedPassword,
        address: '123 Test Street, Test City, TC1 2AB',
        role: 'customer'
      }
    });

    console.log('✅ Test user created successfully!');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: test@pharmacy.com`);
    console.log(`   Password: password123`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Role: ${testUser.role}`);
    
    return testUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    
    // Try with existing admin user instead
    console.log('\n💡 Using existing admin user instead...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (adminUser) {
      console.log('✅ Found admin user:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log('   Password: [you need to know/reset this]');
      return adminUser;
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

async function showLoginInstructions() {
  const user = await createSimpleTestUser();
  
  console.log('\n🚀 LOGIN INSTRUCTIONS:');
  console.log('1. Go to: http://localhost:3000/auth/login');
  console.log('2. Use these credentials:');
  
  if (user && user.email === 'test@pharmacy.com') {
    console.log('   Email: test@pharmacy.com');
    console.log('   Password: password123');
  } else if (user) {
    console.log(`   Email: ${user.email}`);
    console.log('   Password: [admin password - you may need to reset it]');
  }
  
  console.log('3. After login, go to: http://localhost:3000/dashboard/prescriptions');
  console.log('4. Test the multiple medicines prescription submission!');
  console.log('\n💊 The prescription system should now work perfectly!');
}

showLoginInstructions();
