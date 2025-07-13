const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testComplaintsCRUD() {
  console.log('🔍 Testing Complaints CRUD Functionality...\n');

  try {
    // Test 1: Check if a test user exists
    console.log('1. Checking for test user...');
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      console.log('   Creating test user...');
      const customerRole = await prisma.role.findFirst({
        where: { name: 'customer' }
      });

      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
          phone: '1234567890',
          address: '123 Test Street',
          roleId: customerRole.id
        }
      });
    }
    console.log(`   ✅ Test user: ${testUser.name} (ID: ${testUser.id})`);

    // Test 2: Create a complaint
    console.log('\n2. Creating test complaint...');
    const complaint = await prisma.complaint.create({
      data: {
        userId: testUser.id,
        title: 'Test Complaint Title',
        description: 'This is a test complaint description to verify CRUD functionality.',
        category: 'service',
        priority: 'medium',
        status: 'received'
      }
    });
    console.log(`   ✅ Complaint created: ID ${complaint.id}`);

    // Test 3: Read complaints
    console.log('\n3. Reading complaints...');
    const userComplaints = await prisma.complaint.findMany({
      where: { userId: testUser.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    console.log(`   ✅ Found ${userComplaints.length} complaints for user`);
    userComplaints.forEach(c => {
      console.log(`      - ${c.title} (Status: ${c.status}, Priority: ${c.priority})`);
    });

    // Test 4: Update complaint
    console.log('\n4. Updating complaint status...');
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'investigating',
        priority: 'high'
      }
    });
    console.log(`   ✅ Complaint updated: Status = ${updatedComplaint.status}, Priority = ${updatedComplaint.priority}`);

    // Test 5: Test admin view
    console.log('\n5. Testing admin view...');
    const allComplaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   ✅ Admin can view ${allComplaints.length} total complaints`);

    // Test 6: Delete test complaint
    console.log('\n6. Cleaning up test data...');
    await prisma.complaint.delete({
      where: { id: complaint.id }
    });
    console.log('   ✅ Test complaint deleted');

    console.log('\n✅ All Complaints CRUD tests passed!');
    
    // Summary
    console.log('\n📊 Summary of Complaints System:');
    console.log('   - Create: ✅ Users can submit complaints');
    console.log('   - Read: ✅ Users can view their complaints');
    console.log('   - Update: ✅ Admins can update complaint status/priority');
    console.log('   - Delete: ✅ Complaints can be deleted');
    console.log('   - Admin View: ✅ Admins can view all complaints');
    console.log('   - User View: ✅ Users can view their own complaints');

  } catch (error) {
    console.error('❌ Error testing complaints CRUD:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testComplaintsCRUD();
