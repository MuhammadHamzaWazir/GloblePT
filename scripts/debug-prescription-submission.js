const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPrescriptionSubmission() {
  console.log('🔍 Debugging Prescription Submission Issues...\n');

  try {
    // Check if we have users in the database
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found - this could be the authentication issue');
      return;
    }

    // Get a sample user for testing
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        address: true
      }
    });

    console.log('👤 Sample user found:', sampleUser);

    // Check recent prescriptions to see the data structure
    const recentPrescriptions = await prisma.prescription.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        medicine: true,
        medicines: true,
        quantity: true,
        status: true,
        userId: true,
        createdAt: true
      }
    });

    console.log('\n📋 Recent prescriptions:');
    recentPrescriptions.forEach((prescription, index) => {
      console.log(`${index + 1}. ID: ${prescription.id}, User: ${prescription.userId}, Medicine: ${prescription.medicine}`);
      if (prescription.medicines) {
        try {
          const medicines = JSON.parse(prescription.medicines);
          console.log(`   Medicines count: ${medicines.length}`);
        } catch (e) {
          console.log(`   Medicines parsing error: ${e.message}`);
        }
      }
    });

    // Test the validation logic that we implemented
    console.log('\n🧪 Testing validation logic...');
    
    // Test case 1: Valid medicines array
    const validMedicines = [
      { name: 'Test Medicine', dosage: '500mg', quantity: 1, instructions: 'Test' }
    ];
    const hasValidMedicine = validMedicines.some(med => med.name && med.name.trim());
    console.log(`✅ Valid medicines test: ${hasValidMedicine ? 'PASS' : 'FAIL'}`);

    // Test case 2: Empty medicines array
    const emptyMedicines = [];
    const hasValidMedicineEmpty = emptyMedicines.some(med => med.name && med.name.trim());
    console.log(`❌ Empty medicines test: ${hasValidMedicineEmpty ? 'FAIL' : 'PASS'}`);

    // Test case 3: Medicines with empty names
    const emptyNameMedicines = [
      { name: '', dosage: '500mg', quantity: 1, instructions: 'Test' }
    ];
    const hasValidMedicineEmptyName = emptyNameMedicines.some(med => med.name && med.name.trim());
    console.log(`❌ Empty name medicines test: ${hasValidMedicineEmptyName ? 'FAIL' : 'PASS'}`);

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPrescriptionSubmission();
