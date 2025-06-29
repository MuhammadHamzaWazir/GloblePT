const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUserWithSupervisor() {
  const prisma = new PrismaClient();
  try {
    console.log('🔍 Creating a test user with supervisor...');
    
    // Find an admin or staff user to be supervisor
    const supervisor = await prisma.user.findFirst({
      where: {
        OR: [
          { role: { name: { contains: 'admin' } } },
          { role: { name: { contains: 'staff' } } }
        ]
      },
      include: { role: true }
    });
    
    if (!supervisor) {
      console.log('❌ No admin or staff user found to be supervisor');
      return;
    }
    
    console.log(`✅ Found supervisor: ${supervisor.name} (${supervisor.role?.name})`);
    
    // Get customer role
    const customerRole = await prisma.role.findFirst({
      where: { name: { contains: 'customer' } }
    });
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create user with supervisor
    const newUser = await prisma.user.create({
      data: {
        name: 'Test Employee',
        email: 'employee@test.com',
        password: hashedPassword,
        address: '999 Employee Street, Test City, TC 99999',
        roleId: customerRole?.id || null,
        supervisorId: supervisor.id
      },
      include: {
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    console.log('✅ User with supervisor created:');
    console.log('  Name:', newUser.name);
    console.log('  Email:', newUser.email);
    console.log('  Role:', newUser.role?.name || 'No role');
    console.log('  Supervisor:', newUser.supervisor?.name || 'No supervisor');
    console.log('  Supervisor Email:', newUser.supervisor?.email || 'N/A');
    
    console.log('\n📊 Testing supervisor relationship...');
    
    // Get all subordinates of the supervisor
    const subordinates = await prisma.user.findMany({
      where: { supervisorId: supervisor.id },
      include: {
        role: true
      }
    });
    
    console.log(`👥 ${supervisor.name} supervises ${subordinates.length} user(s):`);
    subordinates.forEach(sub => {
      console.log(`  - ${sub.name} (${sub.email}) - ${sub.role?.name || 'No role'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserWithSupervisor();
