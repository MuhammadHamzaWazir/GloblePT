const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');

    // First, let's make sure we have roles
    const roles = await prisma.role.findMany();
    console.log('Available roles:', roles.map(r => `${r.id}: ${r.name}`));

    if (roles.length === 0) {
      console.log('❌ No roles found. Please run the role seeding script first.');
      return;
    }

    // Find role IDs
    const adminRole = roles.find(r => r.name.toLowerCase() === 'admin');
    const staffRole = roles.find(r => r.name.toLowerCase() === 'staff');
    const customerRole = roles.find(r => r.name.toLowerCase() === 'customer');
    const assistantRole = roles.find(r => r.name.toLowerCase() === 'assistant');

    // Test users to create
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        address: '123 Admin Street, Admin City, AC 12345',
        roleId: adminRole?.id || null
      },
      {
        name: 'Staff Member',
        email: 'staff@test.com',
        password: 'password123',
        address: '456 Staff Avenue, Staff Town, ST 67890',
        roleId: staffRole?.id || null
      },
      {
        name: 'John Customer', 
        email: 'customer@test.com',
        password: 'password123',
        address: '789 Customer Road, Customer Village, CV 54321',
        roleId: customerRole?.id || null
      },
      {
        name: 'Assistant Helper',
        email: 'assistant@test.com', 
        password: 'password123',
        address: '321 Assistant Lane, Helper City, HC 98765',
        roleId: assistantRole?.id || null
      },
      {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        address: '555 Test Street, Demo City, DC 11111',
        roleId: customerRole?.id || null
      },
      {
        name: 'Bob Smith',
        email: 'bob@test.com',
        password: 'password123',
        address: '777 Example Boulevard, Sample Town, ST 22222',
        roleId: staffRole?.id || null
      }
    ];

    console.log('🔐 Hashing passwords and creating users...');
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            address: userData.address,
            roleId: userData.roleId
          },
          include: {
            role: true
          }
        });

        console.log(`✅ Created user: ${user.name} (${user.email}) with role: ${user.role?.name || 'No role'}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    console.log('🎉 User seeding completed!');

    // Display summary
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
