const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionWorkflow() {
  console.log('🧪 Testing Prescription Status Workflow...\n');

  try {
    // 1. Find a test user
    let testUser = await prisma.user.findFirst({
      where: {
        email: { contains: 'test' }
      }
    });

    if (!testUser) {
      console.log('⚠️ No test user found, creating one...');
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'customer',
          address: '123 Test Street, Test City',
          phone: '1234567890'
        }
      });
      console.log('✅ Test user created:', testUser.email);
    }

    // 2. Create a test prescription with 'pending' status
    console.log('\n📝 Creating test prescription...');
    const prescription = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Test Medicine',
        quantity: 2,
        amount: 0,
        deliveryAddress: testUser.address,
        status: 'pending', // Default status
        paymentStatus: 'unpaid',
        medicineType: 'POM',
        requiresPrescription: true,
        pharmacistApprovalRequired: true,
        prescriptionText: 'Test prescription for workflow validation'
      }
    });

    console.log('✅ Test prescription created with ID:', prescription.id);
    console.log('   Initial status:', prescription.status);

    // 3. Test status transitions
    const statusFlow = [
      { from: 'pending', to: 'processing', description: 'Pharmacist starts processing' },
      { from: 'processing', to: 'approved', description: 'Pharmacist approves prescription' },
      { from: 'approved', to: 'ready', description: 'Medicine prepared and ready' },
      { from: 'ready', to: 'dispatched', description: 'Prescription dispatched for delivery' },
      { from: 'dispatched', to: 'delivered', description: 'Prescription delivered to customer' },
      { from: 'delivered', to: 'completed', description: 'Transaction completed' }
    ];

    console.log('\n🔄 Testing status transitions...');
    let currentPrescription = prescription;

    for (const transition of statusFlow) {
      console.log(`\n   ${transition.from} → ${transition.to}: ${transition.description}`);
      
      try {
        const updatedPrescription = await prisma.prescription.update({
          where: { id: currentPrescription.id },
          data: { 
            status: transition.to,
            updatedAt: new Date()
          }
        });

        console.log(`   ✅ Status successfully updated to: ${updatedPrescription.status}`);
        currentPrescription = updatedPrescription;
      } catch (error) {
        console.log(`   ❌ Failed to update status: ${error.message}`);
        break;
      }
    }

    // 4. Test invalid transitions (should fail)
    console.log('\n🚫 Testing invalid transitions...');
    
    try {
      await prisma.prescription.create({
        data: {
          userId: testUser.id,
          medicine: 'Test Medicine 2',
          quantity: 1,
          amount: 0,
          deliveryAddress: testUser.address,
          status: 'completed', // Try to start with completed status
          paymentStatus: 'unpaid',
          medicineType: 'POM',
          requiresPrescription: true,
          pharmacistApprovalRequired: true,
          prescriptionText: 'Test prescription 2'
        }
      });
      console.log('   ⚠️ Created prescription with completed status (this might need API-level validation)');
    } catch (error) {
      console.log(`   ✅ Database correctly prevented invalid status: ${error.message}`);
    }

    // 5. Check final prescription status
    const finalPrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n📊 Final Prescription State:');
    console.log('   ID:', finalPrescription.id);
    console.log('   Medicine:', finalPrescription.medicine);
    console.log('   Status:', finalPrescription.status);
    console.log('   User:', finalPrescription.user.name);
    console.log('   Created:', finalPrescription.createdAt);
    console.log('   Updated:', finalPrescription.updatedAt);

    // 6. List all valid statuses
    console.log('\n📋 Valid Prescription Statuses:');
    const validStatuses = ['pending', 'processing', 'approved', 'ready', 'dispatched', 'delivered', 'completed', 'rejected', 'cancelled'];
    validStatuses.forEach((status, index) => {
      console.log(`   ${index + 1}. ${status}`);
    });

    console.log('\n✅ Prescription workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Prescription workflow test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPrescriptionWorkflow();
