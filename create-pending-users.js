const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway"
    }
  }
});

async function createPendingUsers() {
  try {
    console.log('🔍 Creating test pending users...');
    
    const pendingUsers = [
      {
        name: "John Pending",
        email: "john.pending@example.com",
        password: await bcrypt.hash("password123", 12),
        address: "123 Main St, London, UK",
        phone: "+44 123 456 7890",
        dateOfBirth: new Date("1990-01-15"),
        role: "customer",
        accountStatus: "pending",
        identityVerified: false,
        ageVerified: false,
        photoIdUrl: "test-photo-id.jpg",
        addressProofUrl: "test-address-proof.jpg"
      },
      {
        name: "Sarah Review",
        email: "sarah.review@example.com",
        password: await bcrypt.hash("password123", 12),
        address: "456 Oak Ave, Manchester, UK",
        phone: "+44 987 654 3210",
        dateOfBirth: new Date("1985-03-22"),
        role: "customer",
        accountStatus: "pending",
        identityVerified: false,
        ageVerified: false,
        photoIdUrl: "test-photo-id-2.jpg",
        addressProofUrl: "test-address-proof-2.jpg"
      },
      {
        name: "Mike Waiting",
        email: "mike.waiting@example.com",
        password: await bcrypt.hash("password123", 12),
        address: "789 Pine Rd, Birmingham, UK",
        phone: "+44 555 123 4567",
        dateOfBirth: new Date("1988-07-10"),
        role: "customer",
        accountStatus: "pending",
        identityVerified: false,
        ageVerified: false,
        photoIdUrl: "test-photo-id-3.jpg",
        addressProofUrl: "test-address-proof-3.jpg"
      }
    ];
    
    for (const userData of pendingUsers) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✅ Created pending user: ${user.name} (${user.email})`);
    }
    
    // Verify creation
    const pendingCount = await prisma.user.count({
      where: { accountStatus: 'pending' }
    });
    
    console.log(`🎉 Successfully created ${pendingCount} pending users for testing!`);
    
  } catch (error) {
    console.error('❌ Error creating pending users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPendingUsers();
