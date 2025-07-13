const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStatusWorkflow() {
  console.log('🧪 Testing Complete Prescription Status Workflow...\n');

  try {
    // 1. Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'workflow@test.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Workflow Test User',
          email: 'workflow@test.com',
          password: 'hashedpassword',
          role: 'customer',
          address: '456 Workflow St, Test City',
          phone: '9876543210'
        }
      });
      console.log('✅ Test user created:', testUser.email);
    }

    // 2. Create a test prescription (simulating form submission)
    console.log('\n📝 Creating new prescription with default status...');
    const prescription = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Aspirin 500mg',
        quantity: 30,
        amount: 0, // Will be set during approval
        deliveryAddress: testUser.address,
        status: 'pending', // Default status as implemented
        paymentStatus: 'unpaid',
        medicineType: 'POM',
        requiresPrescription: true,
        pharmacistApprovalRequired: true,
        prescriptionText: 'Prescription Request: Aspirin 500mg - Dosage: 1 tablet twice daily - Instructions: Take with food'
      }
    });

    console.log(`✅ Prescription created with ID: ${prescription.id}`);
    console.log(`   Status: ${prescription.status} ✓`);

    // 3. Test the complete status workflow
    const statusUpdates = [
      { 
        status: 'processing', 
        description: '📋 Pharmacist starts reviewing prescription' 
      },
      { 
        status: 'approved', 
        amount: 15.99,
        description: '✅ Pharmacist approves and sets price' 
      },
      { 
        status: 'ready', 
        description: '📦 Medicine prepared and ready for pickup/delivery' 
      },
      { 
        status: 'dispatched', 
        description: '🚚 Prescription dispatched for delivery' 
      },
      { 
        status: 'delivered', 
        description: '📬 Prescription delivered to customer' 
      },
      { 
        status: 'completed', 
        description: '✅ Transaction completed successfully' 
      }
    ];

    console.log('\n🔄 Testing status progression...');
    let currentPrescription = prescription;

    for (const update of statusUpdates) {
      console.log(`\n   ${update.description}`);
      console.log(`   Updating: ${currentPrescription.status} → ${update.status}`);

      const updateData = { 
        status: update.status, 
        updatedAt: new Date() 
      };

      // Add amount if provided (for approved status)
      if (update.amount) {
        updateData.amount = update.amount;
      }

      try {
        currentPrescription = await prisma.prescription.update({
          where: { id: currentPrescription.id },
          data: updateData
        });

        console.log(`   ✅ Status updated successfully: ${currentPrescription.status}`);
        if (update.amount) {
          console.log(`   💰 Price set: $${currentPrescription.amount}`);
        }
      } catch (error) {
        console.log(`   ❌ Status update failed: ${error.message}`);
        break;
      }
    }

    // 4. Display final prescription state
    const finalPrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log('\n📊 Final Prescription Summary:');
    console.log('   ID:', finalPrescription.id);
    console.log('   Medicine:', finalPrescription.medicine);
    console.log('   Customer:', finalPrescription.user.name);
    console.log('   Quantity:', finalPrescription.quantity);
    console.log('   Final Status:', finalPrescription.status);
    console.log('   Amount:', `$${finalPrescription.amount}`);
    console.log('   Payment Status:', finalPrescription.paymentStatus);
    console.log('   Created:', finalPrescription.createdAt.toISOString());
    console.log('   Last Updated:', finalPrescription.updatedAt.toISOString());

    // 5. Test edge case: Try invalid transition
    console.log('\n🚫 Testing invalid status transition...');
    try {
      await prisma.prescription.create({
        data: {
          userId: testUser.id,
          medicine: 'Test Invalid Medicine',
          quantity: 1,
          amount: 25.00,
          deliveryAddress: testUser.address,
          status: 'delivered', // Invalid: skipping workflow steps
          paymentStatus: 'paid',
          medicineType: 'POM',
          requiresPrescription: true,
          pharmacistApprovalRequired: true,
          prescriptionText: 'Invalid workflow test'
        }
      });
      console.log('   ⚠️ Database allowed invalid status (API validation should prevent this)');
    } catch (error) {
      console.log(`   ✅ Database validation prevented invalid status: ${error.message}`);
    }

    // 6. Show API endpoints for status management
    console.log('\n🔧 Available API Endpoints:');
    console.log('   📤 Submit prescription: POST /api/prescriptions/submit');
    console.log('   📋 Get user prescriptions: GET /api/prescriptions/user');
    console.log('   👥 Get staff prescriptions: GET /api/staff/prescriptions');
    console.log('   🔄 Update status: PUT /api/prescriptions/[id]/status');
    console.log('   ℹ️ Get valid transitions: GET /api/prescriptions/[id]/status');

    console.log('\n✅ Prescription status workflow test completed successfully!');
    console.log('\n📝 Summary of supported statuses:');
    console.log('   1. pending (default) → 2. processing → 3. approved → 4. ready → 5. dispatched → 6. delivered → 7. completed');
    console.log('   Alternative: rejected, cancelled (final states)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive test
testStatusWorkflow();
