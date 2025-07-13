const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createApprovedPrescriptionForTesting() {
  console.log('🧪 Creating Approved Prescription for Pay Now Button Testing...\n');

  try {
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: { contains: '@' } }
    });

    if (!user) {
      console.log('❌ No user found for testing');
      return;
    }

    console.log(`👤 Creating approved prescription for: ${user.name} (ID: ${user.id})`);

    // Test data for approved prescription
    const testMedicines = [
      {
        name: 'Paracetamol 500mg',
        dosage: '500mg',
        quantity: 20,
        instructions: 'Take 1-2 tablets every 4-6 hours as needed'
      },
      {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        quantity: 30,
        instructions: 'Take one tablet daily with breakfast'
      }
    ];

    const totalQuantity = testMedicines.reduce((sum, med) => sum + med.quantity, 0);
    const firstMedicine = testMedicines[0];

    // Create an approved prescription with amount
    const prescriptionData = {
      userId: user.id,
      medicine: firstMedicine.name.trim(),
      medicines: JSON.stringify(testMedicines),
      quantity: totalQuantity,
      amount: 24.99, // Set approved amount
      deliveryAddress: user.address || 'Test Address, Test City',
      status: 'approved', // Approved status
      paymentStatus: 'unpaid', // Ready for payment
      medicineType: 'POM',
      requiresPrescription: true,
      pharmacistApprovalRequired: true,
      dosage: firstMedicine.dosage,
      instructions: testMedicines.map((med, index) => 
        `Medicine ${index + 1} (${med.name}): ${med.instructions}`
      ).join(' | '),
      prescriptionText: testMedicines.map(med => 
        `${med.name} (Qty: ${med.quantity}, Dosage: ${med.dosage}, Instructions: ${med.instructions})`
      ).join(' | '),
      approvedBy: user.id, // Approved by admin (using same user for testing)
      approvedAt: new Date()
    };

    const prescription = await prisma.prescription.create({
      data: prescriptionData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log('✅ Approved prescription created successfully!');
    console.log(`   - Prescription ID: ${prescription.id}`);
    console.log(`   - Amount: £${prescription.amount} (ready for payment)`);
    console.log(`   - Status: ${prescription.status}`);
    console.log(`   - Payment Status: ${prescription.paymentStatus}`);
    console.log(`   - Medicines: ${testMedicines.length} medicines`);
    console.log(`   - Total Quantity: ${prescription.quantity}`);

    console.log('\n💡 Now you can test the "Pay Now" button in the frontend!');
    console.log('   - Go to http://localhost:3000/dashboard/prescriptions');
    console.log('   - Look for the approved prescription');
    console.log('   - You should see a green "Pay Now" button');

    // Also create a pending prescription for comparison
    const pendingPrescriptionData = {
      userId: user.id,
      medicine: 'Ibuprofen 200mg',
      medicines: JSON.stringify([{
        name: 'Ibuprofen 200mg',
        dosage: '200mg', 
        quantity: 24,
        instructions: 'Take with food'
      }]),
      quantity: 24,
      amount: 0, // No amount set yet
      deliveryAddress: user.address || 'Test Address, Test City',
      status: 'pending', // Still pending
      paymentStatus: 'unpaid',
      medicineType: 'POM',
      requiresPrescription: true,
      pharmacistApprovalRequired: true,
      dosage: '200mg',
      instructions: 'Take with food',
      prescriptionText: 'Ibuprofen 200mg (Qty: 24, Dosage: 200mg, Instructions: Take with food)'
    };

    const pendingPrescription = await prisma.prescription.create({
      data: pendingPrescriptionData
    });

    console.log(`\n📋 Also created pending prescription (ID: ${pendingPrescription.id}) for comparison`);
    console.log('   - This one should NOT show a Pay Now button (status: pending, amount: 0)');

  } catch (error) {
    console.error('❌ Error creating test prescriptions:', error);
    console.error('❌ Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createApprovedPrescriptionForTesting();
