const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveLatestPrescription() {
  console.log('👨‍⚕️ Admin: Approving Latest Prescription...\n');

  try {
    // Find the latest pending prescription
    const latestPrescription = await prisma.prescription.findFirst({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!latestPrescription) {
      console.log('No pending prescriptions found to approve.');
      return;
    }

    console.log(`Found prescription ${latestPrescription.id} from ${latestPrescription.user.name}`);
    console.log(`Medicine(s): ${latestPrescription.medicine}`);
    
    if (latestPrescription.medicines) {
      try {
        const medicines = JSON.parse(latestPrescription.medicines);
        console.log('Multiple medicines:', medicines.map(m => `${m.name} (${m.quantity})`).join(', '));
      } catch (e) {
        console.log('Single medicine prescription');
      }
    }

    // Approve the prescription and set a price
    const approvedPrescription = await prisma.prescription.update({
      where: { id: latestPrescription.id },
      data: {
        status: 'approved',
        amount: 25.99, // Set a price
        approvedAt: new Date()
      }
    });

    console.log(`✅ Prescription ${approvedPrescription.id} approved!`);
    console.log(`💰 Price set to £${approvedPrescription.amount}`);
    console.log('🎯 Customer can now see "Pay Now" button');

  } catch (error) {
    console.error('❌ Error approving prescription:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

approveLatestPrescription();
