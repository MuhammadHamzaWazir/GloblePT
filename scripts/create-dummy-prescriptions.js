const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDummyPrescriptions() {
  try {
    console.log('🏥 Creating dummy prescription requests...\n');

    // Get some customer users to create prescriptions for
    const customers = await prisma.user.findMany({
      where: { role: { name: 'customer' } },
      take: 5
    });

    if (customers.length === 0) {
      throw new Error('No customers found in database');
    }

    const prescriptionData = [
      {
        userId: customers[0].id,
        medicine: 'Paracetamol 500mg',
        dosage: '500mg',
        instructions: 'Take 1-2 tablets every 4-6 hours as needed for pain relief. Maximum 8 tablets in 24 hours.',
        quantity: 100,
        prescriptionText: `Patient: ${customers[0].name}
Medicine: Paracetamol 500mg Tablets
Quantity: 100 tablets (1 box)
Dosage: 500mg per tablet
Instructions: Take 1-2 tablets every 4-6 hours as needed for pain relief. Do not exceed 8 tablets in 24 hours.
Duration: As needed
Date: ${new Date().toLocaleDateString()}`,
        amount: 12.50,
        deliveryAddress: customers[0].address,
        status: 'pending'
      },
      {
        userId: customers[1].id,
        medicine: 'Amoxicillin 250mg',
        dosage: '250mg',
        instructions: 'Take 1 capsule three times daily for 7 days. Complete the full course.',
        quantity: 21,
        prescriptionText: `Patient: ${customers[1].name}
Medicine: Amoxicillin 250mg Capsules
Quantity: 21 capsules
Dosage: 250mg per capsule
Instructions: Take 1 capsule three times daily with food for 7 days. Complete the full course even if symptoms improve.
Duration: 7 days
Date: ${new Date().toLocaleDateString()}`,
        amount: 8.75,
        deliveryAddress: customers[1].address,
        status: 'pending'
      },
      {
        userId: customers[2].id,
        medicine: 'Lisinopril 10mg',
        dosage: '10mg',
        instructions: 'Take 1 tablet once daily, preferably in the morning.',
        quantity: 30,
        prescriptionText: `Patient: ${customers[2].name}
Medicine: Lisinopril 10mg Tablets
Quantity: 30 tablets (1 month supply)
Dosage: 10mg per tablet
Instructions: Take 1 tablet once daily, preferably in the morning. For blood pressure control.
Duration: Ongoing - monthly repeat
Date: ${new Date().toLocaleDateString()}`,
        amount: 15.25,
        deliveryAddress: customers[2].address,
        status: 'approved',
        approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Approved yesterday
      },
      {
        userId: customers[3].id,
        medicine: 'Insulin Glargine 100u/ml',
        dosage: '10 units',
        instructions: 'Inject 10 units subcutaneously once daily at bedtime.',
        quantity: 1,
        prescriptionText: `Patient: ${customers[3].name}
Medicine: Insulin Glargine 100u/ml Pen
Quantity: 1 pen (3ml)
Dosage: 10 units daily
Instructions: Inject 10 units subcutaneously once daily at bedtime. Rotate injection sites.
Duration: 1 month supply
Date: ${new Date().toLocaleDateString()}`,
        amount: 45.00,
        deliveryAddress: customers[3].address,
        status: 'paid',
        paymentStatus: 'paid',
        paidAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // Paid 12 hours ago
      },
      {
        userId: customers[4].id,
        medicine: 'Salbutamol Inhaler 100mcg',
        dosage: '100mcg per puff',
        instructions: '1-2 puffs as needed for breathlessness. Maximum 8 puffs in 24 hours.',
        quantity: 1,
        prescriptionText: `Patient: ${customers[4].name}
Medicine: Salbutamol Inhaler 100mcg
Quantity: 1 inhaler (200 doses)
Dosage: 100mcg per puff
Instructions: 1-2 puffs as needed for breathlessness or before exercise. Maximum 8 puffs in 24 hours.
Duration: As needed
Date: ${new Date().toLocaleDateString()}`,
        amount: 8.50,
        deliveryAddress: customers[4].address,
        status: 'ready_to_ship',
        paymentStatus: 'paid',
        paidAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // Paid 6 hours ago
      },
      // Add one more with different status
      {
        userId: customers[0].id,
        medicine: 'Omeprazole 20mg',
        dosage: '20mg',
        instructions: 'Take 1 capsule daily before breakfast.',
        quantity: 28,
        prescriptionText: `Patient: ${customers[0].name}
Medicine: Omeprazole 20mg Capsules
Quantity: 28 capsules (4 weeks supply)
Dosage: 20mg per capsule
Instructions: Take 1 capsule daily before breakfast for acid reflux.
Duration: 4 weeks
Date: ${new Date().toLocaleDateString()}`,
        amount: 6.25,
        deliveryAddress: customers[0].address,
        status: 'dispatched',
        paymentStatus: 'paid',
        paidAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // Paid 2 days ago
        trackingNumber: 'RYL123456789GB',
        dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dispatched yesterday
      }
    ];

    // Create prescriptions
    for (const prescription of prescriptionData) {
      const created = await prisma.prescription.create({
        data: prescription,
        include: {
          user: true,
          approvedByUser: true
        }
      });
      
      console.log(`✅ Created prescription for ${created.user.name}: ${created.medicine} (${created.status})`);
    }

    console.log(`\n🎉 Successfully created ${prescriptionData.length} dummy prescriptions!`);
    
    // Show summary
    const statusCounts = await prisma.prescription.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    console.log('\n📊 Prescription Status Summary:');
    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status} prescriptions`);
    });

  } catch (error) {
    console.error('❌ Error creating dummy prescriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyPrescriptions();
