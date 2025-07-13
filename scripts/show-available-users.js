const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showAvailableUsers() {
  console.log('👥 Available Users for Login Testing:\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('📋 User List:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });

    console.log('💡 To test prescription submission:');
    console.log('1. Go to: http://localhost:3004/auth/login');
    console.log('2. Log in with any of the above credentials');
    console.log('3. Navigate to: http://localhost:3004/dashboard/prescriptions');
    console.log('4. Try submitting a prescription');
    console.log('');
    console.log('📝 Note: If you don\'t know the passwords, you may need to reset them');
    console.log('   or create a new test user with a known password.');

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showAvailableUsers();
