// Script to run database operations using Vercel's production environment
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function createUserInProduction() {
  try {
    console.log('🔄 Creating user in production database...');
    
    // Use vercel env pull to get production environment
    console.log('Pulling production environment variables...');
    await execAsync('vercel env pull .env.production --environment=production');
    
    console.log('Environment pulled. Now creating user...');
    
    // Source the production environment and run the user creation script
    const createUserScript = `
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
    `;

    // Write the script to a temporary file
    require('fs').writeFileSync('temp-create-user-prod.js', createUserScript);
    
    // Execute the script
    const { stdout, stderr } = await execAsync('node temp-create-user-prod.js');
    console.log(stdout);
    if (stderr) {
      console.error('Stderr:', stderr);
    }

    // Clean up
    require('fs').unlinkSync('temp-create-user-prod.js');
    require('fs').unlinkSync('.env.production');

    console.log('✅ Production user creation completed!');

  } catch (error) {
    console.error('❌ Error in production user creation:', error);
  }
}

if (require.main === module) {
  createUserInProduction();
}

module.exports = { createUserInProduction };
