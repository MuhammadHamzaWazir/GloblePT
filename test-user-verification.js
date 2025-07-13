// Test script for the complete user verification workflow
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserVerificationWorkflow() {
  console.log('🧪 Testing User Verification Workflow');
  console.log('=====================================');
  
  try {
    // Test 1: Check admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Status:', adminUser.accountStatus);
    } else {
      console.log('⚠️ No admin user found. Creating one...');
      // Create admin user for testing
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: 'admin@globalpharma.com',
          password: hashedPassword,
          address: '123 Admin Street, London, UK',
          phone: '+44 20 1234 5678',
          dateOfBirth: new Date('1980-01-01'),
          role: 'admin',
          accountStatus: 'verified',
          identityVerified: true,
          ageVerified: true
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
    // Test 2: Check pending users
    const pendingUsers = await prisma.user.findMany({
      where: { accountStatus: 'pending' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photoIdUrl: true,
        addressProofUrl: true,
        createdAt: true
      }
    });
    
    console.log(`\n📋 Found ${pendingUsers.length} pending user(s):`);
    pendingUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Phone: ${user.phone}`);
      console.log(`     Photo ID: ${user.photoIdUrl ? '✅ Uploaded' : '❌ Missing'}`);
      console.log(`     Address Proof: ${user.addressProofUrl ? '✅ Uploaded' : '❌ Missing'}`);
      console.log(`     Registered: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Test 3: Check verified users
    const verifiedUsers = await prisma.user.findMany({
      where: { accountStatus: 'verified' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        identityVerified: true,
        identityVerifiedAt: true
      }
    });
    
    console.log(`📋 Found ${verifiedUsers.length} verified user(s):`);
    verifiedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`     Identity Verified: ${user.identityVerified ? '✅' : '❌'}`);
      if (user.identityVerifiedAt) {
        console.log(`     Verified On: ${user.identityVerifiedAt.toLocaleDateString()}`);
      }
      console.log('');
    });
    
    console.log('\n🔗 Test URLs:');
    console.log('1. Registration: http://localhost:3000/auth/register');
    console.log('2. Login: http://localhost:3000/auth/login');
    console.log('3. Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('4. Pending Users (Admin): http://localhost:3000/admin/dashboard/pending-users');
    
    console.log('\n📝 Testing Instructions:');
    console.log('1. Register a new user with phone and upload documents');
    console.log('2. Try to login with new user (should be blocked - pending approval)');
    console.log('3. Login as admin: admin@globalpharma.com / admin123');
    console.log('4. Go to "Pending Approvals" in admin dashboard');
    console.log('5. Review documents and approve/reject user');
    console.log('6. User should receive email notification');
    console.log('7. Approved user can now login successfully');
    
    console.log('\n🔧 API Endpoints:');
    console.log('- GET /api/admin/pending-users (list pending users)');
    console.log('- POST /api/admin/pending-users (approve/reject user)');
    console.log('- GET /api/uploads/[filename] (view uploaded documents - admin only)');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserVerificationWorkflow();
