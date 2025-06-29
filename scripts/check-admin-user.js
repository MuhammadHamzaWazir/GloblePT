const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
      include: { role: true }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role?.name || 'No role');
      console.log('   Password hash (first 20 chars):', user.password.substring(0, 20) + '...');
      
      // Test password
      const passwordMatch = await bcrypt.compare('password123', user.password);
      console.log('   Password match for "password123":', passwordMatch ? '✅ Correct' : '❌ Wrong');
      
      if (!passwordMatch) {
        console.log('🔄 Resetting password to "password123"...');
        const newHash = await bcrypt.hash('password123', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash }
        });
        console.log('✅ Password reset successfully');
      }
    } else {
      console.log('❌ User not found');
      console.log('🔄 Creating admin user...');
      
      // Find admin role
      const adminRole = await prisma.role.findFirst({
        where: { name: { equals: 'admin', mode: 'insensitive' } }
      });
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@test.com',
          password: hashedPassword,
          address: '123 Admin Street, Admin City, AC 12345',
          roleId: adminRole?.id || null
        },
        include: { role: true }
      });
      
      console.log('✅ Admin user created:', newUser.name, newUser.email);
    }
    
    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await prisma.user.findMany({
      include: { role: true }
    });
    
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - Role: ${u.role?.name || 'No role'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
