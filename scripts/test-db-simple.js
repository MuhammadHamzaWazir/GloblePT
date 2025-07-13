const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log('✅ Database connected. User count:', userCount);
    
    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pharmacy.com' }
    });
    console.log('👤 Admin user found:', adminUser ? '✅' : '❌');
    
    if (adminUser) {
      console.log('📋 Admin user details:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      });
      
      // Test prescription query for this user
      console.log('💊 Testing prescription query...');
      const prescriptions = await prisma.prescription.findMany({
        where: { userId: adminUser.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          medicine: true,
          medicines: true,
          status: true,
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
      
      console.log('💊 Prescriptions found:', prescriptions.length);
      if (prescriptions.length > 0) {
        console.log('📋 First prescription:', {
          id: prescriptions[0].id,
          medicine: prescriptions[0].medicine,
          status: prescriptions[0].status
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
