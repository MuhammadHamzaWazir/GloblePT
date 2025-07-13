const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConversationCreation() {
  try {
    console.log('🧪 Testing conversation creation...');

    // First, get a regular user
    const regularUser = await prisma.user.findFirst({
      where: { role: 'customer' }
    });

    if (!regularUser) {
      console.log('❌ No customer users found');
      return;
    }

    console.log(`👤 Found customer user: ${regularUser.name} (ID: ${regularUser.id})`);

    // Get an admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ No admin users found');
      return;
    }

    console.log(`👑 Found admin user: ${adminUser.name} (ID: ${adminUser.id})`);

    // Test creating a conversation (simulate what the API does)
    const conversation = await prisma.conversation.create({
      data: {
        subject: 'Test conversation',
        priority: 'normal',
        participants: {
          create: [
            {
              userId: regularUser.id,
              isAdmin: false
            },
            {
              userId: adminUser.id,
              isAdmin: true
            }
          ]
        }
      }
    });

    console.log(`✅ Created conversation with ID: ${conversation.id}`);

    // Create an initial message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: regularUser.id,
        content: 'This is a test message',
        messageType: 'text'
      }
    });

    console.log(`📝 Created message with ID: ${message.id}`);

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message.content,
        lastMessageAt: new Date()
      }
    });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConversationCreation();
