
      require('dotenv').config({ path: '.env.production' });
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');

      const prisma = new PrismaClient();

      async function createUser() {
        try {
          const email = 'logout-test@example.com';
          const password = 'TestLogout123!';
          const hashedPassword = await bcrypt.hash(password, 12);

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (existingUser) {
            console.log('✅ Test user already exists in production:', existingUser.email);
            return;
          }

          // Get customer role
          const customerRole = await prisma.role.findFirst({
            where: { name: 'customer' }
          });

          if (!customerRole) {
            throw new Error('Customer role not found');
          }

          const user = await prisma.user.create({
            data: {
              name: 'Logout Test User',
              email,
              password: hashedPassword,
              address: '123 Test Street, Test City, TE1 2ST',
              roleId: customerRole.id,
              twoFactorEnabled: false,
              accountStatus: 'verified'
            }
          });

          console.log('✅ Created test user in production:', user.email);

        } catch (error) {
          console.error('❌ Error creating user in production:', error);
        } finally {
          await prisma.$disconnect();
        }
      }

      createUser();
    