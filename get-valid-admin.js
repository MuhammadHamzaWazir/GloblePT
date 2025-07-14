const { PrismaClient } = require('@prisma/client');

async function getValidAdminCredentials() {
  // Use production DATABASE_URL
  process.env.DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
  
  const prisma = new PrismaClient();
  
  try {
    const adminUsers = await prisma.user.findMany({
      where: { 
        role: 'admin',
        accountStatus: 'approved'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true
      }
    });
    
    console.log('Available admin users for testing:');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Status: ${user.accountStatus}`);
      console.log('');
    });
    
    if (adminUsers.length > 0) {
      console.log(`Try logging in with: ${adminUsers[0].email}`);
      console.log('If you know the password, or try common passwords like: admin123, password, 12345678');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getValidAdminCredentials();
