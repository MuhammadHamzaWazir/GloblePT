const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function healthCheck() {
  console.log('🏥 Running health check...');
  
  try {
    // Check database connection
    console.log('📊 Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: OK');
    
    // Check user count
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);
    
    // Check prescription count
    const prescriptionCount = await prisma.prescription.count();
    console.log(`✅ Prescriptions in database: ${prescriptionCount}`);
    
    // Check order count
    const orderCount = await prisma.order.count();
    console.log(`✅ Orders in database: ${orderCount}`);
    
    // Check admin users
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    });
    console.log(`✅ Admin users: ${adminCount}`);
    
    // Check verified users
    const verifiedCount = await prisma.user.count({
      where: { accountStatus: 'verified' }
    });
    console.log(`✅ Verified users: ${verifiedCount}`);
    
    console.log('\n🎉 Health check completed successfully!');
    
    // Return health status
    return {
      status: 'healthy',
      database: 'connected',
      users: userCount,
      prescriptions: prescriptionCount,
      orders: orderCount,
      admins: adminCount,
      verified: verifiedCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await prisma.$disconnect();
  }
}

// If running directly
if (require.main === module) {
  healthCheck()
    .then(result => {
      console.log('\nHealth Check Result:', JSON.stringify(result, null, 2));
      process.exit(result.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check error:', error);
      process.exit(1);
    });
}

module.exports = { healthCheck };
