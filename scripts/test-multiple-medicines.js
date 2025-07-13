const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMultipleMedicinesPrescription() {
  console.log('🧪 Testing Multiple Medicines Prescription System...\n');

  try {
    // Find a test user
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@'
        }
      }
    });

    if (!user) {
      console.log('❌ No user found for testing');
      return;
    }

    console.log(`📋 Testing with user: ${user.name} (${user.email})`);

    // Test data for multiple medicines
    const testMedicines = [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        quantity: 2,
        instructions: 'Take twice daily with food'
      },
      {
        name: 'Ibuprofen',
        dosage: '200mg', 
        quantity: 1,
        instructions: 'Take once daily after meals'
      },
      {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        quantity: 1,
        instructions: 'Take once daily with breakfast'
      }
    ];

    // Create test prescription with multiple medicines
    const prescription = await prisma.prescription.create({
      data: {
        userId: user.id,
        medicine: testMedicines[0].name, // Legacy field
        medicines: JSON.stringify(testMedicines), // New field for multiple medicines
        quantity: testMedicines.reduce((sum, med) => sum + med.quantity, 0), // Total quantity
        dosage: testMedicines[0].dosage, // Legacy field
        amount: 0,
        deliveryAddress: user.address || '123 Test Street, Test City',
        status: 'pending',
        paymentStatus: 'unpaid',
        medicineType: 'POM',
        requiresPrescription: true,
        pharmacistApprovalRequired: true,
        instructions: testMedicines.map((med, index) => 
          `Medicine ${index + 1} (${med.name}): ${med.instructions}`
        ).join(' | '),
        prescriptionText: `Prescription Request: ${testMedicines.map(med => 
          `${med.name} (Qty: ${med.quantity}, Dosage: ${med.dosage}, Instructions: ${med.instructions})`
        ).join(' | ')}`
      }
    });

    console.log(`✅ Created test prescription with ID: ${prescription.id}`);
    console.log(`📊 Total medicines: ${testMedicines.length}`);
    console.log(`📊 Total quantity: ${prescription.quantity}`);
    console.log(`📋 Legacy medicine field: ${prescription.medicine}`);
    console.log(`📋 Medicines JSON:`, JSON.parse(prescription.medicines || '[]'));

    // Test retrieving and parsing the prescription
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

    if (retrievedPrescription && retrievedPrescription.medicines) {
      const parsedMedicines = JSON.parse(retrievedPrescription.medicines);
      console.log('\n📖 Successfully retrieved and parsed prescription:');
      console.log(`   User: ${retrievedPrescription.user.name}`);
      console.log(`   Status: ${retrievedPrescription.status}`);
      console.log(`   Total Quantity: ${retrievedPrescription.quantity}`);
      console.log('   Medicines:');
      parsedMedicines.forEach((med, index) => {
        console.log(`     ${index + 1}. ${med.name} - ${med.dosage} - Qty: ${med.quantity}`);
        if (med.instructions) {
          console.log(`        Instructions: ${med.instructions}`);
        }
      });
    }

    console.log('\n✅ Multiple medicines prescription test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing multiple medicines prescription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMultipleMedicinesPrescription();
