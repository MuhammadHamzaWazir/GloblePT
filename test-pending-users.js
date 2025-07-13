const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway"
    }
  }
});

async function testPendingUsersAPI() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log('✅ Database connected. Total users:', userCount);
    
    // Test pending users query
    console.log('🔍 Testing pending users query...');
    const pendingUsers = await prisma.user.findMany({
      where: {
        accountStatus: 'pending'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        photoIdUrl: true,
        addressProofUrl: true,
        createdAt: true,
        identityVerified: true,
        ageVerified: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('✅ Pending users query successful. Found:', pendingUsers.length);
    
    if (pendingUsers.length > 0) {
      console.log('📋 Sample pending user:', {
        id: pendingUsers[0].id,
        name: pendingUsers[0].name,
        email: pendingUsers[0].email,
        accountStatus: pendingUsers[0].accountStatus
      });
    }
    
    // Check if we have any users with different statuses
    const allStatuses = await prisma.user.groupBy({
      by: ['accountStatus'],
      _count: {
        accountStatus: true
      }
    });
    
    console.log('📊 User account statuses:', allStatuses);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPendingUsersAPI();
