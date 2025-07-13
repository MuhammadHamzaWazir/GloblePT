const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPrescriptionFields() {
  try {
    console.log('🔍 Checking available prescription fields...');
    
    // Create a test prescription to see what fields are available
    const testUser = await prisma.user.findFirst({
      where: { email: 'admin@pharmacy.com' }
    });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    // Get all prescription fields by creating and reading a record
    const testPrescription = await prisma.prescription.create({
      data: {
        userId: testUser.id,
        medicine: 'Test Field Check',
        quantity: 1,
        amount: 10.0,
        deliveryAddress: testUser.address || 'Test Address',
        status: 'pending'
      }
    });

    console.log('✅ Test prescription created:', testPrescription.id);

    // Now read it back to see all available fields
    const fullPrescription = await prisma.prescription.findUnique({
      where: { id: testPrescription.id }
    });

    console.log('📋 Available fields:');
    Object.keys(fullPrescription).forEach(field => {
      console.log(`  - ${field}: ${typeof fullPrescription[field]}`);
    });

    // Clean up
    await prisma.prescription.delete({
      where: { id: testPrescription.id }
    });

    console.log('🧹 Test prescription cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrescriptionFields();
