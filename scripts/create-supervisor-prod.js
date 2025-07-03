const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const supervisorRole = await prisma.role.findFirst({ where: { name: 'SUPERVISOR' } });
    if (!supervisorRole) {
      console.log('SUPERVISOR role not found. Creating...');
      await prisma.role.create({ data: { name: 'SUPERVISOR' } });
    }
    const password = await bcrypt.hash('supervisor123', 10);
    const email = 'supervisor@pharmacy.com';
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: {
          password,
          role: { connect: { name: 'SUPERVISOR' } },
          identityVerified: true,
          ageVerified: true,
          capacityAssessed: true,
          accountStatus: 'verified',
        },
      });
      console.log('Supervisor user updated.');
    } else {
      await prisma.user.create({
        data: {
          name: 'Supervisor Test',
          email,
          password,
          address: '123 Supervisor Street',
          phone: '555-0001',
          role: { connect: { name: 'SUPERVISOR' } },
          identityVerified: true,
          ageVerified: true,
          capacityAssessed: true,
          accountStatus: 'verified',
        },
      });
      console.log('Supervisor user created.');
    }
    console.log('Login: supervisor@pharmacy.com / supervisor123');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
