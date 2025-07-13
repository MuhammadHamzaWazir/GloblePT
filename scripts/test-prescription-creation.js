const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionSubmission() {
  console.log('🧪 Testing Prescription Submission with New Schema...\n');

  try {
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: { contains: '@' } }
    });

    if (!user) {
      console.log('❌ No user found for testing');
      return;
    }

    console.log(`👤 Testing with user: ${user.name} (ID: ${user.id})`);

    // Test data similar to what the form would send
    const testMedicines = [
      {
        name: 'Test Medicine A',
        dosage: '500mg',
        quantity: 1,
        instructions: 'Take with food'
      },
      {
        name: 'Test Medicine B', 
        dosage: '200mg',
        quantity: 2,
        instructions: 'Take after meals'
      }
    ];

    const totalQuantity = testMedicines.reduce((sum, med) => sum + med.quantity, 0);
    const firstMedicine = testMedicines[0];

    // Create prescription data exactly like the API does
    const prescriptionData = {
      userId: user.id,
      medicine: firstMedicine.name.trim(),
      medicines: JSON.stringify(testMedicines),
      quantity: totalQuantity,
      // amount will use default value from schema
      deliveryAddress: user.address || 'Test Address',
      status: 'pending',
      paymentStatus: 'unpaid',
      medicineType: 'POM',
      requiresPrescription: true,
      pharmacistApprovalRequired: true,
      dosage: firstMedicine.dosage,
      instructions: testMedicines.map((med, index) => 
        `Medicine ${index + 1} (${med.name}): ${med.instructions}`
      ).join(' | '),
      prescriptionText: testMedicines.map(med => 
        `${med.name} (Qty: ${med.quantity}, Dosage: ${med.dosage}, Instructions: ${med.instructions})`
      ).join(' | ')
    };

    console.log('📋 Attempting to create prescription with data:');
    console.log('   - Medicines count:', testMedicines.length);
    console.log('   - Total quantity:', totalQuantity);
    console.log('   - User ID:', user.id);
    console.log('   - Delivery address:', prescriptionData.deliveryAddress);

    // Try to create the prescription
    const prescription = await prisma.prescription.create({
      data: prescriptionData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log('✅ Prescription created successfully!');
    console.log(`   - Prescription ID: ${prescription.id}`);
    console.log(`   - Amount: ${prescription.amount} (should be 0)`);
    console.log(`   - Status: ${prescription.status}`);
    console.log(`   - Payment Status: ${prescription.paymentStatus}`);
    console.log(`   - Legacy medicine: ${prescription.medicine}`);
    
    if (prescription.medicines) {
      const medicines = JSON.parse(prescription.medicines);
      console.log(`   - Medicines stored: ${medicines.length} medicines`);
    }

    console.log('\n💡 The prescription submission should now work in the frontend!');

  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    console.error('❌ Error message:', error.message);
    
    if (error.message.includes('amount')) {
      console.log('💡 The issue is with the amount field. Let me check schema...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrescriptionSubmission();
