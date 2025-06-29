const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showUsersTable() {
  try {
    console.log('📋 Current Users in Database\n');

    const users = await prisma.user.findMany({
      include: {
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { role: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('┌────┬─────────────────────────┬─────────────────────────────────┬─────────────┬──────────────────────────────┐');
    console.log('│ ID │ Name                    │ Email                           │ Role        │ Supervisor                   │');
    console.log('├────┼─────────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────┤');

    users.forEach(user => {
      const id = user.id.toString().padEnd(2);
      const name = user.name.substring(0, 23).padEnd(23);
      const email = user.email.substring(0, 31).padEnd(31);
      const role = (user.role?.name || 'No Role').padEnd(11);
      const supervisor = user.supervisor 
        ? `${user.supervisor.name} (${user.supervisor.role?.name})`.substring(0, 28).padEnd(28)
        : 'No Supervisor'.padEnd(28);

      console.log(`│ ${id} │ ${name} │ ${email} │ ${role} │ ${supervisor} │`);
    });

    console.log('└────┴─────────────────────────┴─────────────────────────────────┴─────────────┴──────────────────────────────┘');

    // Summary statistics
    const stats = await Promise.all([
      prisma.user.count({ where: { role: { name: 'admin' } } }),
      prisma.user.count({ where: { role: { name: 'staff' } } }),
      prisma.user.count({ where: { role: { name: 'assistant' } } }),
      prisma.user.count({ where: { role: { name: 'customer' } } }),
      prisma.user.count({ where: { supervisorId: { not: null } } }),
      prisma.user.count()
    ]);

    console.log('\n📊 Summary Statistics:');
    console.log(`   👑 Admins: ${stats[0]}`);
    console.log(`   👔 Staff: ${stats[1]}`);
    console.log(`   🤝 Assistants: ${stats[2]}`);
    console.log(`   🛒 Customers: ${stats[3]}`);
    console.log(`   👥 With Supervisors: ${stats[4]}`);
    console.log(`   📈 Total Users: ${stats[5]}`);

    console.log('\n🌐 Access the Admin Dashboard:');
    console.log('   URL: http://localhost:3000/auth/login');
    console.log('   Admin Login: admin@test.com / password123');
    console.log('   Click "Users" in the sidebar to see the full interface!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showUsersTable();
