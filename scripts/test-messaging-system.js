const { PrismaClient } = require('@prisma/client');

async function testMessagingSystem() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Messaging System\n');
    
    // Find a customer and admin user
    const customer = await prisma.user.findFirst({
      where: { role: 'customer' }
    });
    
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!customer || !admin) {
      console.log('❌ Need both customer and admin users');
      return;
    }
    
    console.log(`👤 Customer: ${customer.name} (ID: ${customer.id})`);
    console.log(`👮 Admin: ${admin.name} (ID: ${admin.id})\n`);
    
    // Create a test conversation
    console.log('📝 Creating test conversation...');
    const conversation = await prisma.conversation.create({
      data: {
        subject: 'Test Support Request',
        priority: 'normal',
        isArchived: false,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: customer.id },
            { userId: admin.id }
          ]
        },
        messages: {
          create: {
            content: 'Hello, I need help with my prescription.',
            senderId: customer.id,
            messageType: 'text',
            isSystemMessage: false
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: true
      }
    });
    
    console.log('✅ Conversation created:', {
      id: conversation.id,
      subject: conversation.subject,
      participants: conversation.participants.map(p => p.user.name),
      messageCount: conversation.messages.length
    });
    
    // Add admin reply
    console.log('\n📨 Adding admin reply...');
    const reply = await prisma.message.create({
      data: {
        content: 'Hello! I\'m happy to help you with your prescription. What specific issue are you having?',
        senderId: admin.id,
        messageType: 'text',
        isSystemMessage: false,
        conversationId: conversation.id
      }
    });
    
    console.log('✅ Admin reply added');
    
    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });
    
    console.log('\n📊 Final conversation status:');
    const finalConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true
          }
        }
      }
    });
    
    console.log(`- Conversation ID: ${finalConversation.id}`);
    console.log(`- Subject: ${finalConversation.subject}`);
    console.log(`- Messages: ${finalConversation.messages.length}`);
    finalConversation.messages.forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg.sender.name}: ${msg.content}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMessagingSystem();
