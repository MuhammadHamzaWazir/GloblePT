// Create a test user locally, then test logout flow in production
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'logout-test@example.com';
    const password = 'TestLogout123!';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return { email, password };
    }

    // Get customer role
    const customerRole = await prisma.role.findFirst({
      where: { name: 'customer' }
    });

    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    const user = await prisma.user.create({
      data: {
        name: 'Logout Test User',
        email,
        password: hashedPassword,
        address: '123 Test Street, Test City, TE1 2ST',
        roleId: customerRole.id,
        twoFactorEnabled: false,
        accountStatus: 'verified' // Set to verified to allow login
      }
    });

    console.log('✅ Created test user:', user.email);
    return { email, password };

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestUser()
    .then(({ email, password }) => {
      console.log('\n🎯 Test user ready for logout testing:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('\nNow you can test logout flow with these credentials in production.');
    })
    .catch(console.error);
}

module.exports = { createTestUser };
