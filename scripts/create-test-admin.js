const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    console.log('🔍 Creating test admin user...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@test.com" }
    });

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Password hashed');

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "admin@test.com",
        password: hashedPassword,
        address: "123 Test Street, Test City, TC 12345",
        role: "admin",
        accountStatus: "verified",
        identityVerified: true,
        ageVerified: true
      }
    });

    console.log('✅ Test admin user created:');
    console.log('- ID:', adminUser.id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Status:', adminUser.accountStatus);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
