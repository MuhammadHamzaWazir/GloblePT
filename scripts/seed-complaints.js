const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedComplaints() {
  try {
    console.log('🗄️ Seeding complaint data...\n');

    // First, let's get some users and staff members
    const customers = await prisma.user.findMany({
      where: {
        role: {
          name: 'customer'
        }
      },
      take: 5
    });

    const staff = await prisma.staff.findMany({ take: 3 });

    if (customers.length === 0) {
      console.log('❌ No customers found. Please seed users first.');
      return;
    }

    // Create diverse complaints
    const complaintsData = [
      {
        userId: customers[0].id,
        title: "Delayed Prescription Delivery",
        description: "My prescription was supposed to be delivered 3 days ago but I haven't received it yet. I've been calling but no one answers. This is causing me health issues as I need my medication urgently.",
        category: "delivery",
        priority: "high",
        status: "received"
      },
      {
        userId: customers[1]?.id || customers[0].id,
        title: "Rude Staff Behavior",
        description: "The pharmacist at the counter was very rude and unprofessional when I asked about my prescription. They made me feel uncomfortable and dismissed my concerns about medication side effects.",
        category: "staff",
        priority: "medium",
        status: "received"
      },
      {
        userId: customers[2]?.id || customers[0].id,
        title: "Wrong Medication Dispensed",
        description: "I was given the wrong medication. I ordered Amoxicillin 500mg but received Paracetamol instead. This could have been dangerous if I hadn't double-checked.",
        category: "product",
        priority: "urgent",
        status: "investigating",
        assignedToId: staff[0]?.id,
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: customers[3]?.id || customers[0].id,
        title: "Overcharged for Prescription",
        description: "I was charged £45 for a prescription that should cost £20 according to NHS guidelines. When I questioned this, the staff couldn't provide a clear explanation.",
        category: "billing",
        priority: "medium",
        status: "investigating",
        assignedToId: staff[1]?.id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: customers[4]?.id || customers[0].id,
        title: "Poor Website Experience",
        description: "The online prescription ordering system is very confusing and slow. I tried multiple times to submit my prescription but the form keeps timing out.",
        category: "service",
        priority: "low",
        status: "resolved",
        assignedToId: staff[2]?.id,
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resolution: "Website has been updated with improved performance and clearer navigation. Customer was contacted and confirmed the issue is resolved.",
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: customers[0].id,
        title: "Prescription Not Ready on Time",
        description: "I was told my prescription would be ready for collection in 2 hours, but when I arrived 4 hours later, it still wasn't ready. No one called to inform me of the delay.",
        category: "service",
        priority: "medium",
        status: "received"
      }
    ];

    // Create complaints
    for (const complaintData of complaintsData) {
      try {
        const complaint = await prisma.complaint.create({
          data: complaintData,
          include: {
            user: {
              select: { name: true, email: true }
            },
            assignedTo: {
              select: { name: true, email: true }
            }
          }
        });
        
        console.log(`✅ Created complaint: "${complaint.title}" by ${complaint.user.name} (Status: ${complaint.status})`);
        if (complaint.assignedTo) {
          console.log(`   📋 Assigned to: ${complaint.assignedTo.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create complaint: ${error.message}`);
      }
    }

    console.log('\n✅ Complaint seeding completed!');

    // Show summary
    const totalComplaints = await prisma.complaint.count();
    const statusCounts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    console.log(`\n📊 Summary: ${totalComplaints} total complaints`);
    statusCounts.forEach(({ status, _count }) => {
      console.log(`   - ${status}: ${_count.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding complaints:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedComplaints();
