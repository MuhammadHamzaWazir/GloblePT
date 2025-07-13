const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    console.log('🔍 Fetching all users from the database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        phone: true,
        address: true,
        createdAt: true,
        // Don't select password for security, but we'll note if it exists
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      return;
    }

    console.log(`📊 Found ${users.length} users in the database:\n`);
    console.log('=' * 80);
    
    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    // Display users grouped by role
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🏷️  ${role.toUpperCase()} USERS (${usersByRole[role].length}):`);
      console.log('-'.repeat(50));
      
      usersByRole[role].forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.accountStatus}`);
        console.log(`   Phone: ${user.phone || 'Not provided'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    });

    // Display login instructions
    console.log('\n🔑 LOGIN INSTRUCTIONS:');
    console.log('=' * 50);
    console.log('To log in as any user, use their EMAIL ADDRESS and password.');
    console.log('\nDefault passwords for test users:');
    console.log('• Admin users: "admin123" or "password123"');
    console.log('• Staff users: "staff123" or "password123"');
    console.log('• Customer users: "password123" or "customer123"');
    console.log('\nLogin URL: http://localhost:3000/auth/login');
    
    // Check for common test accounts
    console.log('\n🧪 COMMON TEST ACCOUNTS:');
    console.log('-'.repeat(30));
    
    const commonEmails = [
      'admin@globalpharmatrading.co.uk',
      'pharmacist@globalpharmatrading.co.uk',
      'test@example.com',
      'user@test.com',
      'customer@test.com'
    ];
    
    commonEmails.forEach(email => {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`✅ ${email} (${user.role}) - Status: ${user.accountStatus}`);
      }
    });

    // Show account status summary
    console.log('\n📈 ACCOUNT STATUS SUMMARY:');
    console.log('-'.repeat(30));
    const statusCounts = users.reduce((acc, user) => {
      acc[user.accountStatus] = (acc[user.accountStatus] || 0) + 1;
      return acc;
    }, {});
    
    Object.keys(statusCounts).forEach(status => {
      console.log(`${status}: ${statusCounts[status]} users`);
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Also create a function to create a test user if needed
async function createTestUser() {
  try {
    const testEmail = 'test@pharmacy.com';
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log(`✅ Test user already exists: ${testEmail}`);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'customer',
        accountStatus: 'verified',
        address: '123 Test Street, London, UK',
        phone: '07123456789',
        dateOfBirth: new Date('1990-01-01'),
        photoIdUrl: '/uploads/test-id.jpg',
        addressProofUrl: '/uploads/test-address.jpg'
      }
    });

    console.log(`✅ Created test user: ${testUser.email} (Password: password123)`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Main execution
console.log('🏥 Global Pharma Trading - User Database Report');
console.log('Generated on:', new Date().toLocaleString());
console.log('');

getAllUsers()
  .then(() => {
    console.log('\n✅ Report completed successfully!');
    console.log('\n💡 Tips:');
    console.log('• Use the email addresses above to log in');
    console.log('• If you forgot a password, you can reset it through the admin panel');
    console.log('• Users with "pending" status need admin approval before they can log in');
  })
  .catch(console.error);
