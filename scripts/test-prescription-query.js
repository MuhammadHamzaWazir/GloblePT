const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionQuery() {
  try {
    console.log('🧪 Testing prescription query with specific user...');
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pharmacy.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Testing with user ID:', adminUser.id);
    
    // Create a test prescription for debugging
    console.log('📝 Creating test prescription...');
    const testPrescription = await prisma.prescription.create({
      data: {
        userId: adminUser.id,
        medicine: 'Test Medicine',
        medicines: JSON.stringify([{
          name: 'Test Medicine',
          dosage: '10mg',
          quantity: 30,
          instructions: 'Take one daily'
        }]),
        quantity: 30,
        amount: 25.50,
        deliveryAddress: adminUser.address || 'Test Address',
        medicineType: 'P',
        status: 'approved',
        paymentStatus: 'unpaid',
        fileUrls: JSON.stringify(['test-file.pdf']),
        filename: 'test-prescription.pdf'
      }
    });
    
    console.log('✅ Test prescription created with ID:', testPrescription.id);
    
    // Now test the exact same query that the API uses
    console.log('🔍 Testing API query...');
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: adminUser.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        medicine: true,
        medicines: true,
        status: true,
        prescriptionText: true,
        quantity: true,
        amount: true,
        paymentStatus: true,
        medicineType: true,
        fileUrls: true,
        filename: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('✅ Query successful! Found prescriptions:', prescriptions.length);
    
    if (prescriptions.length > 0) {
      const firstPrescription = prescriptions[0];
      console.log('📋 First prescription data:', {
        id: firstPrescription.id,
        medicine: firstPrescription.medicine,
        medicines: firstPrescription.medicines,
        fileUrls: firstPrescription.fileUrls,
        status: firstPrescription.status
      });
      
      // Test the transformation logic
      console.log('🔄 Testing transformation...');
      const transformed = {
        id: firstPrescription.id.toString(),
        medicine: firstPrescription.medicine || 'Prescription',
        medicines: firstPrescription.medicines || null,
        filename: firstPrescription.filename || firstPrescription.medicine || 'Prescription',
        fileUrl: firstPrescription.fileUrls ? JSON.parse(firstPrescription.fileUrls)[0] : null,
        fileUrls: firstPrescription.fileUrls ? JSON.parse(firstPrescription.fileUrls) : [],
        quantity: firstPrescription.quantity,
        amount: firstPrescription.amount,
        status: firstPrescription.status,
        paymentStatus: firstPrescription.paymentStatus,
        medicineType: firstPrescription.medicineType,
        uploadedAt: firstPrescription.createdAt,
        updatedAt: firstPrescription.updatedAt
      };
      
      console.log('✅ Transformation successful:', transformed);
    }
    
    // Clean up test prescription
    await prisma.prescription.delete({
      where: { id: testPrescription.id }
    });
    console.log('🧹 Test prescription cleaned up');
    
  } catch (error) {
    console.error('❌ Error in prescription query test:', error);
    console.error('❌ Full error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testPrescriptionQuery();
