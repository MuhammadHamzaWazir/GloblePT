const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkComplaints() {
  try {
    console.log('🔍 Checking complaints in database...');
    
    const complaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('📊 Total complaints:', complaints.length);
    
    if (complaints.length > 0) {
      console.log('📝 Complaint records:');
      complaints.forEach(c => {
        console.log(`  - ID: ${c.id}, Title: ${c.title}, Status: ${c.status}, User: ${c.user?.name || 'Unknown'}`);
      });
    } else {
      console.log('⚠️ No complaints found. Creating test complaints...');
      
      // Create test complaints
      const users = await prisma.user.findMany({
        where: { role: 'customer' },
        take: 2
      });
      
      if (users.length > 0) {
        for (let i = 0; i < 2; i++) {
          const complaint = await prisma.complaint.create({
            data: {
              title: `Test Complaint ${i + 1}`,
              description: `This is a test complaint description for complaint ${i + 1}`,
              category: 'service',
              priority: i === 0 ? 'high' : 'normal',
              status: 'open',
              userId: users[i % users.length].id
            }
          });
          console.log('✅ Created test complaint:', complaint.title);
        }
      } else {
        console.log('❌ No customer users found to create complaints');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking complaints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkComplaints();
