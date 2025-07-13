const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createSupervisorUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating supervisor test user...');
    
    // Find the SUPERVISOR role
    const supervisorRole = await prisma.role.findUnique({
      where: { name: 'SUPERVISOR' }
    });
    
    if (!supervisorRole) {
      console.error('SUPERVISOR role not found');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('supervisor123', 10);
    
    // Check if supervisor user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'supervisor@pharmacy.com' }
    });
    
    if (existingUser) {
      console.log('Supervisor user already exists. Updating role...');
      const updatedUser = await prisma.user.update({
        where: { email: 'supervisor@pharmacy.com' },
        data: { roleId: supervisorRole.id },
        include: { role: true }
      });
      console.log('Updated supervisor user:', updatedUser);
    } else {
      const supervisorUser = await prisma.user.create({
        data: {
          name: 'Supervisor Test',
          email: 'supervisor@pharmacy.com',
          password: hashedPassword,
          address: '123 Supervisor Street',
          phone: '555-0001',
          roleId: supervisorRole.id,
          identityVerified: true,
          ageVerified: true,
          capacityAssessed: true,
          accountStatus: 'verified'
        },
        include: { role: true }
      });
      
      console.log('Created supervisor user:', supervisorUser);
      console.log('Login credentials: supervisor@pharmacy.com / supervisor123');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSupervisorUser();
