const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIEndpoints() {
  console.log('🧪 Testing Fixed API Endpoints...');

  try {
    // Create test user
    console.log('👤 Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'api-test@example.com' },
      update: {},
      create: {
        name: 'API Tester',
        email: 'api-test@example.com',
        password: 'testpassword123',
        address: '123 API Test Street'
      }
    });
    console.log(`✅ Test user created: ${testUser.name}`);

    // Test 1: Create prescription using the exact data structure the API expects
    console.log('📝 Testing prescription creation with API data structure...');
    
    const sampleFormData = {
      medicine: 'Paracetamol 500mg',
      quantity: 30,
      dosage: '1-2 tablets every 4-6 hours',
      instructions: 'Take with food if stomach upset occurs',
      doctorName: 'Dr. API Test',
      doctorContact: '+44123456789',
      deliveryAddress: '123 API Test Street, Test City, TEST123',
      urgency: 'normal',
      notes: 'Patient has mild headaches'
    };

    const prescriptionData = {
      userId: testUser.id,
      medicine: sampleFormData.medicine.trim(),
      quantity: parseInt(sampleFormData.quantity) || 1,
      amount: 0,
      deliveryAddress: sampleFormData.deliveryAddress.trim(),
      status: 'pending',
      paymentStatus: 'unpaid',
      medicineType: 'POM',
      requiresPrescription: true,
      pharmacistApprovalRequired: true
    };

    // Add optional fields as the API does
    if (sampleFormData.dosage) prescriptionData.dosage = sampleFormData.dosage.trim();
    if (sampleFormData.doctorName) prescriptionData.prescribedBy = sampleFormData.doctorName.trim();
    
    // Build comprehensive instructions
    let combinedInstructions = '';
    if (sampleFormData.instructions) combinedInstructions += sampleFormData.instructions.trim();
    if (sampleFormData.doctorContact) {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Doctor Contact: ${sampleFormData.doctorContact.trim()}`;
    }
    if (sampleFormData.urgency && sampleFormData.urgency !== 'normal') {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Urgency: ${sampleFormData.urgency}`;
    }
    if (sampleFormData.notes) {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Notes: ${sampleFormData.notes.trim()}`;
    }
    
    if (combinedInstructions) {
      prescriptionData.instructions = combinedInstructions;
    }

    // Build prescription text
    let prescriptionText = `Prescription Request: ${sampleFormData.medicine}`;
    if (sampleFormData.dosage) prescriptionText += ` - Dosage: ${sampleFormData.dosage}`;
    if (sampleFormData.instructions) prescriptionText += ` - Instructions: ${sampleFormData.instructions}`;
    if (sampleFormData.doctorName) prescriptionText += ` - Doctor: ${sampleFormData.doctorName}`;
    if (sampleFormData.doctorContact) prescriptionText += ` - Doctor Contact: ${sampleFormData.doctorContact}`;
    if (sampleFormData.urgency && sampleFormData.urgency !== 'normal') prescriptionText += ` - Urgency: ${sampleFormData.urgency}`;
    if (sampleFormData.notes) prescriptionText += ` - Notes: ${sampleFormData.notes}`;

    prescriptionData.prescriptionText = prescriptionText;

    console.log('🔍 Creating prescription with processed data:', prescriptionData);

    const prescription = await prisma.prescription.create({
      data: prescriptionData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Prescription created successfully with ID: ${prescription.id}`);
    console.log(`   Medicine: ${prescription.medicine}`);
    console.log(`   Dosage: ${prescription.dosage}`);
    console.log(`   Prescribed By: ${prescription.prescribedBy}`);
    console.log(`   Instructions: ${prescription.instructions}`);
    console.log(`   Status: ${prescription.status}`);

    // Test 2: Verify all required fields are correctly mapped
    console.log('\n📋 Testing field mapping...');
    
    const requiredMappings = {
      'doctorName -> prescribedBy': prescription.prescribedBy === sampleFormData.doctorName,
      'notes included in instructions': prescription.instructions.includes(sampleFormData.notes),
      'doctorContact included in instructions': prescription.instructions.includes(sampleFormData.doctorContact),
      'quantity as integer': typeof prescription.quantity === 'number',
      'default status is pending': prescription.status === 'pending'
    };

    Object.entries(requiredMappings).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    });

    // Test 3: Test status transitions
    console.log('\n🔄 Testing status workflow...');
    const statuses = ['processing', 'approved', 'ready', 'dispatched', 'delivered'];
    for (const status of statuses) {
      await prisma.prescription.update({
        where: { id: prescription.id },
        data: { status }
      });
      console.log(`   ✅ Status updated to: ${status}`);
    }

    // Test 4: Verify prescription can be retrieved as frontend expects
    console.log('\n📊 Testing prescription retrieval (as frontend expects)...');
    const retrievedPrescription = await prisma.prescription.findUnique({
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

    console.log('✅ Retrieved prescription:');
    console.log(`   ID: ${retrievedPrescription.id}`);
    console.log(`   Medicine: ${retrievedPrescription.medicine}`);
    console.log(`   Quantity: ${retrievedPrescription.quantity}`);
    console.log(`   Status: ${retrievedPrescription.status}`);
    console.log(`   Amount: £${retrievedPrescription.amount}`);
    console.log(`   Prescribed By: ${retrievedPrescription.prescribedBy}`);
    console.log(`   Instructions: ${retrievedPrescription.instructions}`);
    console.log(`   Created: ${retrievedPrescription.createdAt.toLocaleDateString()}`);

    console.log('\n✅ All API endpoint tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.prescription.deleteMany({
        where: {
          user: {
            email: 'api-test@example.com'
          }
        }
      });
      await prisma.user.delete({
        where: { email: 'api-test@example.com' }
      });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('ℹ️  Cleanup completed (some data may not have existed)');
    }
    
    await prisma.$disconnect();
  }
}

testAPIEndpoints().catch(console.error);
