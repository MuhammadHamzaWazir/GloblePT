const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRoles() {
  try {
    console.log('🔄 Updating user roles for testing role-based redirection...\n');

    // Update specific users to different roles for testing
    const updates = [
      {
        email: 'admin@globalpharmatrading.co.uk',
        role: 'admin',
        description: 'Admin User'
      },
      {
        email: 'pharmacist@globalpharmatrading.co.uk', 
        role: 'staff',
        description: 'Dr. Sarah Johnson (Pharmacist)'
      },
      {
        email: 'assistant@globalpharmatrading.co.uk',
        role: 'assistant', 
        description: 'Mike Wilson (Assistant)'
      },
      {
        email: 'test@example.com',
        role: 'customer',
        description: 'Test Customer'
      },
      {
        email: 'customer1@mailinator.com',
        role: 'customer',
        description: 'John Smith (Customer)'
      }
    ];

    for (const update of updates) {
      try {
        const user = await prisma.user.update({
          where: { email: update.email },
          data: { role: update.role },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        
        console.log(`✅ Updated ${update.description}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Expected redirect: ${getRoleRedirect(user.role)}`);
        console.log('');
        
      } catch (error) {
        console.log(`❌ Failed to update ${update.email}: User not found or error occurred`);
        console.log('');
      }
    }

    // Show all users with their roles
    console.log('📋 Current user roles:');
    console.log('-'.repeat(50));
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    const roleGroups = allUsers.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    Object.keys(roleGroups).forEach(role => {
      console.log(`\n🏷️  ${role.toUpperCase()} USERS (${roleGroups[role].length}):`);
      roleGroups[role].forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Status: ${user.accountStatus}`);
        console.log(`   Dashboard: ${getRoleRedirect(user.role)}`);
      });
    });

    console.log('\n🧪 TESTING INSTRUCTIONS:');
    console.log('-'.repeat(40));
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Go to: http://localhost:3000/auth/login');
    console.log('3. Try logging in with these accounts:');
    console.log('');
    console.log('🛡️  ADMIN (should redirect to /admin/dashboard):');
    console.log('   Email: admin@globalpharmatrading.co.uk');
    console.log('   Password: admin123 or password123');
    console.log('');
    console.log('👨‍⚕️ STAFF (should redirect to /staff-dashboard):');
    console.log('   Email: pharmacist@globalpharmatrading.co.uk');
    console.log('   Password: staff123 or password123');
    console.log('');
    console.log('🤝 ASSISTANT (should redirect to /assistant-portal):');
    console.log('   Email: assistant@globalpharmatrading.co.uk');
    console.log('   Password: password123');
    console.log('');
    console.log('👤 CUSTOMER (should redirect to /dashboard):');
    console.log('   Email: test@example.com');
    console.log('   Password: password123 or customer123');

  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getRoleRedirect(role) {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'STAFF':
      return '/staff-dashboard';
    case 'SUPERVISOR':
      return '/supervisor-dashboard';
    case 'ASSISTANT':
      return '/assistant-portal';
    case 'CUSTOMER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

console.log('🏥 Global Pharma Trading - Role-Based Redirection Setup');
console.log('Generated on:', new Date().toLocaleString());
console.log('');

updateUserRoles()
  .then(() => {
    console.log('\n✅ Role-based redirection setup completed!');
    console.log('\n💡 Tips:');
    console.log('• Each role will now redirect to its specific dashboard after login');
    console.log('• Test the redirection by logging in with different role accounts');
    console.log('• Check browser console for redirection logs');
  })
  .catch(console.error);
