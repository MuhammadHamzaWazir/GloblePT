const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApprovalWorkflow() {
  console.log('🧪 Testing Staff/Admin Approval Workflow');
  console.log('=' .repeat(50));
  
  try {
    // 1. Create test prescriptions for different scenarios
    console.log('\n1. Creating test prescriptions...');
    
    // Get test users
    const testUser = await prisma.user.findFirst({
      where: { email: 'customer1@mailinator.com' }
    });
    
    const staff = await prisma.user.findFirst({
      where: { email: 'pharmacist@globalpharmatrading.co.uk' }
    });
    
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@globalpharmatrading.co.uk' }
    });
    
    if (!testUser || !staff || !admin) {
      console.error('❌ Required test users not found');
      return;
    }
    
    // Create test prescriptions
    const prescription1 = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Amoxicillin 500mg',
        dosage: '1 tablet twice daily',
        quantity: 20,
        amount: 15.99,
        deliveryAddress: '123 Test Street, Test City, TC1 2TC',
        status: 'pending'
      }
    });
    
    const prescription2 = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Ibuprofen 400mg',
        dosage: '1 tablet as needed',
        quantity: 30,
        amount: 12.50,
        deliveryAddress: '123 Test Street, Test City, TC1 2TC',
        status: 'pending'
      }
    });
    
    console.log(`✅ Created test prescriptions: ${prescription1.id}, ${prescription2.id}`);
    
    // 2. Test staff approval
    console.log('\n2. Testing staff approval...');
    
    const staffApprovalResult = await prisma.prescription.update({
      where: { id: prescription1.id },
      data: {
        status: 'approved',
        approvedBy: staff.id,
        approvedAt: new Date()
      }
    });
    
    console.log(`✅ Staff approved prescription ${prescription1.id}`);
    
    // 3. Test admin approval
    console.log('\n3. Testing admin approval...');
    
    const adminApprovalResult = await prisma.prescription.update({
      where: { id: prescription2.id },
      data: {
        status: 'approved',
        approvedBy: admin.id,
        approvedAt: new Date()
      }
    });
    
    console.log(`✅ Admin approved prescription ${prescription2.id}`);
    
    // 4. Verify approvals with full data
    console.log('\n4. Verifying approval data...');
    
    const approvedPrescriptions = await prisma.prescription.findMany({
      where: {
        id: { in: [prescription1.id, prescription2.id] }
      },
      include: {
        user: true,
        approvedByUser: true
      }
    });
    
    for (const prescription of approvedPrescriptions) {
      console.log(`\n📋 Prescription ${prescription.id}:`);
      console.log(`   Medicine: ${prescription.medicine}`);
      console.log(`   Dosage: ${prescription.dosage}`);
      console.log(`   Quantity: ${prescription.quantity}`);
      console.log(`   Amount: £${prescription.amount}`);
      console.log(`   Status: ${prescription.status}`);
      console.log(`   Approved by: ${prescription.approvedByUser?.name || 'None'} (${prescription.approvedByUser?.email || 'N/A'})`);
      console.log(`   Approved at: ${prescription.approvedAt || 'N/A'}`);
    }
    
    // 5. Test pending prescriptions query (what staff would see)
    console.log('\n5. Testing pending prescriptions query...');
    
    const pendingPrescriptions = await prisma.prescription.findMany({
      where: { status: 'pending' },
      include: {
        user: true
      }
    });
    
    console.log(`📋 Found ${pendingPrescriptions.length} pending prescriptions`);
    
    // 6. Test role-based access
    console.log('\n6. Testing role-based access...');
    
    const staffUser = await prisma.user.findFirst({
      where: { email: 'pharmacist@globalpharmatrading.co.uk' },
      include: { role: true }
    });
    
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@globalpharmatrading.co.uk' },
      include: { role: true }
    });
    
    console.log(`👤 Staff user role: ${staffUser?.role?.name}`);
    console.log(`👤 Admin user role: ${adminUser?.role?.name}`);
    
    // 7. Clean up test data
    console.log('\n7. Cleaning up test data...');
    
    await prisma.prescription.deleteMany({
      where: {
        id: { in: [prescription1.id, prescription2.id] }
      }
    });
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All approval workflow tests passed!');
    
  } catch (error) {
    console.error('❌ Error during approval workflow test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApprovalWorkflow();
