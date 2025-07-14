const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTestUser() {
  try {
    console.log('🔍 Checking for test admin user...');
    
    const user = await prisma.user.findUnique({
      where: {
        email: "admin@test.com"
      }
    });

    if (user) {
      console.log('✅ Test admin user found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Role:', user.role);
      console.log('- Account Status:', user.accountStatus);
      console.log('- Password Hash Length:', user.password?.length || 0);
    } else {
      console.log('❌ Test admin user not found');
      
      // Check what users exist
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });
      
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.email} (${u.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUser();
