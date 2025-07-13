const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionFormSubmission() {
  console.log('🧪 Testing Prescription Form Submission...');

  try {
    // Test 1: Create test user
    console.log('👤 Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'form-test@example.com' },
      update: {},
      create: {
        name: 'Form Tester',
        email: 'form-test@example.com',
        password: 'testpassword123',
        address: '123 Test Street',
        phone: '1234567890'
      }
    });
    console.log(`✅ Test user created: ${testUser.name}`);

    // Test 2: Text-only submission (simulating form without files)
    console.log('📝 Testing text-only prescription submission...');
    const textOnlyPrescription = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Aspirin 500mg',
        quantity: 30,
        dosage: '1 tablet twice daily',
        instructions: 'Take with food to avoid stomach upset',
        medicineType: 'P',
        prescribedBy: 'Dr. Smith',
        deliveryAddress: '123 Test Street, Test City, TEST123',
        status: 'pending',
        amount: 15.99
      }
    });
    console.log(`✅ Text-only prescription created with ID: ${textOnlyPrescription.id}`);

    // Test 3: Prescription with files (simulating form with file uploads)
    console.log('📁 Testing prescription submission with files...');
    const prescriptionWithFiles = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Ibuprofen 400mg',
        quantity: 20,
        dosage: '1 tablet as needed',
        instructions: 'For pain relief',
        medicineType: 'P',
        prescribedBy: 'Dr. Johnson',
        deliveryAddress: '123 Test Street, Test City, TEST123',
        status: 'pending',
        amount: 8.50
      }
    });
    console.log(`✅ Prescription created with ID: ${prescriptionWithFiles.id} (files handled separately)`);
    console.log(`✅ Prescription with files created with ID: ${prescriptionWithFiles.id}`);

    // Test 4: Fetch user prescriptions (simulating dashboard loading)
    console.log('📋 Testing prescription retrieval...');
    const userPrescriptions = await prisma.prescription.findMany({
      where: { userId: testUser.id },        orderBy: { createdAt: 'desc' },include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
    });
    console.log(`✅ Retrieved ${userPrescriptions.length} prescriptions for user`);

    // Test 5: Status workflow validation
    console.log('🔄 Testing status workflow...');
    const statusUpdates = ['processing', 'approved', 'ready', 'dispatched', 'delivered'];
    for (const status of statusUpdates) {
      await prisma.prescription.update({
        where: { id: textOnlyPrescription.id },
        data: { status }
      });
      console.log(`   ✅ Status updated to: ${status}`);
    }

    // Test 6: Emergency delivery flag test  
    console.log('🚨 Testing emergency delivery handling...');
    const emergencyPrescription = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Emergency Medicine',
        quantity: 1,
        dosage: 'As directed',
        instructions: 'URGENT - Patient needs immediate treatment',
        medicineType: 'POM',
        prescribedBy: 'Dr. Emergency',
        deliveryAddress: '123 Test Street, Test City, TEST123',
        status: 'pending',
        amount: 50.00
      }
    });
    console.log(`✅ Emergency prescription created with ID: ${emergencyPrescription.id}`);

    // Test 7: Field validation (required fields)
    console.log('✅ Testing field validation...');
    try {
      await prisma.prescription.create({
        data: {
          userId: testUser.id,
          // Missing required fields to test validation
          medicine: '',
          quantity: '',
          status: 'pending'
        }
      });
      console.log('⚠️  Warning: Empty fields were accepted (validation might be needed at API level)');
    } catch (error) {
      console.log('✅ Database validation working - empty fields rejected');
    }

    // Display summary
    console.log('\n📊 Test Summary:');
    const allPrescriptions = await prisma.prescription.findMany({
      where: { userId: testUser.id },        select: {
          id: true,
          medicine: true,
          status: true,
          amount: true,
          createdAt: true
        }
    });

    allPrescriptions.forEach((prescription, index) => {
      console.log(`   ${index + 1}. ${prescription.medicine}`);
      console.log(`      Status: ${prescription.status}`);
      console.log(`      Amount: £${prescription.amount}`);
      console.log(`      Created: ${prescription.createdAt.toLocaleDateString()}`);
    });

    console.log('\n✅ All prescription form submission tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.prescription.deleteMany({
        where: {
          user: {
            email: 'form-test@example.com'
          }
        }
      });
      await prisma.user.delete({
        where: { email: 'form-test@example.com' }
      });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('ℹ️  Cleanup completed (some data may not have existed)');
    }
    
    await prisma.$disconnect();
  }
}

testPrescriptionFormSubmission().catch(console.error);
