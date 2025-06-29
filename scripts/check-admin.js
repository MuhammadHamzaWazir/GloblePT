const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  const prisma = new PrismaClient();
  try {
    console.log('🔍 Checking admin user...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
      include: { role: true }
    });
    
    if (user) {
      console.log('✅ Admin user found:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role?.name || 'No role');
      console.log('  Address:', user.address);
      console.log('  Password hash starts with:', user.password.substring(0, 10) + '...');
      
      // Test password verification
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('  Password "password123" test:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('  ⚠️  Password hash might be corrupted. Regenerating...');
        const newHash = await bcrypt.hash('password123', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash }
        });
        console.log('  ✅ Password hash regenerated');
      }
    } else {
      console.log('❌ Admin user not found!');
      console.log('🔍 Checking all users...');
      
      const allUsers = await prisma.user.findMany({
        include: { role: true }
      });
      
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role?.name || 'No role'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
