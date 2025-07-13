const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPrescriptionWithFiles() {
  try {
    console.log('🧪 Creating test prescription with file data...');
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pharmacy.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Create test prescription with file data
    const prescription = await prisma.prescription.create({
      data: {
        userId: adminUser.id,
        medicine: 'Amoxicillin 500mg',
        medicines: JSON.stringify([
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            quantity: 21,
            instructions: 'Take one capsule three times a day with food'
          }
        ]),
        quantity: 21,
        amount: 15.99,
        deliveryAddress: adminUser.address || 'Test Address',
        medicineType: 'POM',
        status: 'approved',
        paymentStatus: 'unpaid',
        fileUrls: JSON.stringify([
          '/uploads/prescriptions/prescription-1.pdf',
          '/uploads/prescriptions/prescription-1-page2.pdf'
        ]),
        filename: 'amoxicillin-prescription.pdf'
      }
    });

    console.log('✅ Test prescription created with ID:', prescription.id);
    console.log('📋 Prescription details:', {
      id: prescription.id,
      medicine: prescription.medicine,
      status: prescription.status,
      amount: prescription.amount,
      fileUrls: prescription.fileUrls,
      filename: prescription.filename
    });

    return prescription.id;

  } catch (error) {
    console.error('❌ Error creating test prescription:', error.message);
    return null;
  }
}

createTestPrescriptionWithFiles();
