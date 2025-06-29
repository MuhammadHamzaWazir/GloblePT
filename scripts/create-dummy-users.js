const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDummyUsers() {
  try {
    console.log('🌱 Creating comprehensive dummy user dataset...');

    // Get all roles first
    const roles = await prisma.role.findMany();
    console.log('Available roles:', roles.map(r => `${r.id}: ${r.name}`));

    const adminRole = roles.find(r => r.name.toLowerCase() === 'admin');
    const staffRole = roles.find(r => r.name.toLowerCase() === 'staff');
    const customerRole = roles.find(r => r.name.toLowerCase() === 'customer');
    const assistantRole = roles.find(r => r.name.toLowerCase() === 'assistant');

    // Comprehensive dummy users dataset
    const dummyUsers = [
      // More Admins
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@pharmacy.com',
        password: 'password123',
        address: '101 Executive Plaza, Admin District, AD 10001',
        roleId: adminRole?.id,
        supervisorId: null // Top-level admin
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@pharmacy.com',
        password: 'password123',
        address: '102 Management Avenue, Admin City, AC 10002',
        roleId: adminRole?.id,
        supervisorId: null
      },

      // Staff Members with Admin Supervisors
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@pharmacy.com',
        password: 'password123',
        address: '201 Staff Street, Pharmacy District, PD 20001',
        roleId: staffRole?.id,
        supervisorId: null // Will be set to admin after creation
      },
      {
        name: 'David Rodriguez',
        email: 'david.rodriguez@pharmacy.com',
        password: 'password123',
        address: '202 Healthcare Lane, Medical Center, MC 20002',
        roleId: staffRole?.id,
        supervisorId: null
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa.thompson@pharmacy.com',
        password: 'password123',
        address: '203 Medication Way, Pharma Town, PT 20003',
        roleId: staffRole?.id,
        supervisorId: null
      },
      {
        name: 'James Miller',
        email: 'james.miller@pharmacy.com',
        password: 'password123',
        address: '204 Prescription Plaza, Drug District, DD 20004',
        roleId: staffRole?.id,
        supervisorId: null
      },

      // Assistants with Staff Supervisors
      {
        name: 'Sophie Brown',
        email: 'sophie.brown@pharmacy.com',
        password: 'password123',
        address: '301 Assistant Avenue, Helper Heights, HH 30001',
        roleId: assistantRole?.id,
        supervisorId: null
      },
      {
        name: 'Alex Garcia',
        email: 'alex.garcia@pharmacy.com',
        password: 'password123',
        address: '302 Support Street, Aid Alley, AA 30002',
        roleId: assistantRole?.id,
        supervisorId: null
      },
      {
        name: 'Rachel Davis',
        email: 'rachel.davis@pharmacy.com',
        password: 'password123',
        address: '303 Helper Highway, Service Square, SS 30003',
        roleId: assistantRole?.id,
        supervisorId: null
      },

      // Customers (various supervisors)
      {
        name: 'John Anderson',
        email: 'john.anderson@email.com',
        password: 'password123',
        address: '401 Customer Court, Client City, CC 40001',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Maria Gonzalez',
        email: 'maria.gonzalez@email.com',
        password: 'password123',
        address: '402 Patient Place, Health Haven, HH 40002',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Robert Taylor',
        email: 'robert.taylor@email.com',
        password: 'password123',
        address: '403 Client Circle, Customer Corner, CC 40003',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer.lee@email.com',
        password: 'password123',
        address: '404 Buyer Boulevard, Purchase Park, PP 40004',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'William Martinez',
        email: 'william.martinez@email.com',
        password: 'password123',
        address: '405 Consumer Close, Shopper Street, SS 40005',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Ashley White',
        email: 'ashley.white@email.com',
        password: 'password123',
        address: '406 Patron Plaza, Member Manor, MM 40006',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Christopher Moore',
        email: 'christopher.moore@email.com',
        password: 'password123',
        address: '407 User University, Client College, CC 40007',
        roleId: customerRole?.id,
        supervisorId: null
      },
      {
        name: 'Amanda Clark',
        email: 'amanda.clark@email.com',
        password: 'password123',
        address: '408 Subscriber Square, Follower Field, FF 40008',
        roleId: customerRole?.id,
        supervisorId: null
      },

      // More diverse users
      {
        name: 'Dr. Kevin Singh',
        email: 'kevin.singh@pharmacy.com',
        password: 'password123',
        address: '501 Medical Mile, Doctor Drive, DD 50001',
        roleId: staffRole?.id,
        supervisorId: null
      },
      {
        name: 'Nurse Betty Adams',
        email: 'betty.adams@pharmacy.com',
        password: 'password123',
        address: '502 Nursing Network, Care Center, CC 50002',
        roleId: assistantRole?.id,
        supervisorId: null
      }
    ];

    console.log(`🔐 Creating ${dummyUsers.length} dummy users...`);
    
    const createdUsers = [];
    
    for (const userData of dummyUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          createdUsers.push(existingUser);
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

        createdUsers.push(user);
        console.log(`✅ Created: ${user.name} (${user.role?.name}) - ${user.email}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n👥 Setting up supervisor relationships...');
    
    // Now set up supervisor relationships
    const adminUsers = createdUsers.filter(u => u.role?.name.toLowerCase() === 'admin');
    const staffUsers = createdUsers.filter(u => u.role?.name.toLowerCase() === 'staff');
    const assistantUsers = createdUsers.filter(u => u.role?.name.toLowerCase() === 'assistant');
    const customerUsers = createdUsers.filter(u => u.role?.name.toLowerCase() === 'customer');

    // Assign admins as supervisors for some staff
    if (adminUsers.length > 0 && staffUsers.length > 0) {
      for (let i = 0; i < Math.min(staffUsers.length, 4); i++) {
        const staff = staffUsers[i];
        const supervisor = adminUsers[i % adminUsers.length];
        
        await prisma.user.update({
          where: { id: staff.id },
          data: { supervisorId: supervisor.id }
        });
        console.log(`👔 ${staff.name} now reports to ${supervisor.name}`);
      }
    }

    // Assign staff as supervisors for assistants
    if (staffUsers.length > 0 && assistantUsers.length > 0) {
      for (let i = 0; i < assistantUsers.length; i++) {
        const assistant = assistantUsers[i];
        const supervisor = staffUsers[i % Math.min(staffUsers.length, 3)]; // Use first 3 staff
        
        await prisma.user.update({
          where: { id: assistant.id },
          data: { supervisorId: supervisor.id }
        });
        console.log(`🤝 ${assistant.name} now reports to ${supervisor.name}`);
      }
    }

    // Assign various supervisors for customers (mix of staff and assistants)
    if (customerUsers.length > 0) {
      const supervisors = [...staffUsers.slice(0, 2), ...assistantUsers.slice(0, 2)];
      
      for (let i = 0; i < Math.min(customerUsers.length, 6); i++) {
        const customer = customerUsers[i];
        const supervisor = supervisors[i % supervisors.length];
        
        if (supervisor) {
          await prisma.user.update({
            where: { id: customer.id },
            data: { supervisorId: supervisor.id }
          });
          console.log(`🛒 ${customer.name} now reports to ${supervisor.name}`);
        }
      }
    }

    console.log('\n📊 Final Summary:');
    const totalUsers = await prisma.user.count();
    
    const usersByRole = await prisma.user.groupBy({
      by: ['roleId'],
      _count: true,
      orderBy: { roleId: 'asc' }
    });

    console.log(`📈 Total users in database: ${totalUsers}`);
    
    for (const group of usersByRole) {
      const role = roles.find(r => r.id === group.roleId);
      console.log(`   ${role?.name || 'No Role'}: ${group._count} users`);
    }

    const usersWithSupervisors = await prisma.user.count({
      where: { supervisorId: { not: null } }
    });
    
    console.log(`👥 Users with supervisors: ${usersWithSupervisors}`);
    console.log(`🆓 Users without supervisors: ${totalUsers - usersWithSupervisors}`);

    console.log('\n🎉 Dummy user creation completed!');
    console.log('👉 You can now view all users in the admin dashboard at:');
    console.log('   http://localhost:3000/auth/login');
    console.log('   Login: admin@test.com / password123');

  } catch (error) {
    console.error('❌ Error during dummy user creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyUsers();
