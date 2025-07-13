const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugGPDetails() {
  try {
    console.log('=== Debugging GP Details System ===\n');
    
    // Check if users table exists and has GP fields
    console.log('1. Checking User table structure...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        gpName: true,
        gpAddress: true,
        gpPhone: true,
        gpEmail: true,
        practiceName: true,
        nhsNumber: true
      },
      take: 5
    });
    
    console.log('Sample users with GP fields:', JSON.stringify(users, null, 2));
    
    // Test creating/updating GP details for a test user
    const testUser = users[0];
    if (testUser) {
      console.log(`\n2. Testing GP details update for user: ${testUser.name}`);
      
      const updated = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          gpName: 'Dr. Test GP',
          gpAddress: '123 Test Street, Test City, TC1 2TC',
          gpPhone: '01234567890',
          gpEmail: 'test.gp@nhs.uk',
          practiceName: 'Test Medical Practice',
          nhsNumber: '1234567890'
        }
      });
      
      console.log('Update successful:', !!updated);
      
      // Verify the update
      const verified = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          gpName: true,
          gpAddress: true,
          gpPhone: true,
          gpEmail: true,
          practiceName: true,
          nhsNumber: true
        }
      });
      
      console.log('Verified GP details:', JSON.stringify(verified, null, 2));
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGPDetails();
