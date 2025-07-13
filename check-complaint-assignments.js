const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkComplaintAssignments() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } }
      }
    });
    
    console.log('All complaints:');
    complaints.forEach(complaint => {
      console.log(`- ID: ${complaint.id}, Title: ${complaint.title}`);
      console.log(`  Customer: ${complaint.user.name} (${complaint.user.email})`);
      console.log(`  Assigned to: ${complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned'}`);
      console.log(`  Status: ${complaint.status}`);
      console.log('');
    });
    
    console.log('Staff table:');
    const staff = await prisma.staff.findMany();
    staff.forEach(s => {
      console.log(`- ID: ${s.id}, Name: ${s.name}, Email: ${s.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkComplaintAssignments();
