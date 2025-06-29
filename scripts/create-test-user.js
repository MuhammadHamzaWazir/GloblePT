const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    const testEmail = 'test@test.com';
    const testPassword = '12345678';
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('Test user already exists:', testEmail);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User Login',
        email: testEmail,
        password: hashedPassword,
        address: 'Test Address',
        roleId: 3, // customer role
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('Test user created successfully:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('User ID:', user.id);
    
  } catch (error) {
    console.error('Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
