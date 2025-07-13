const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAssistantPassword() {
  try {
    // Find the assistant user
    const assistantUser = await prisma.user.findUnique({
      where: { email: 'assistant@globalpharmatrading.co.uk' }
    });
    
    if (!assistantUser) {
      console.log('❌ Assistant user not found');
      return;
    }
    
    console.log('Found assistant user:', assistantUser.name);
    
    // Hash a new password
    const hashedPassword = await bcrypt.hash('assistant123', 10);
    
    // Update the password
    await prisma.user.update({
      where: { id: assistantUser.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password updated for assistant user');
    console.log('New credentials: assistant@globalpharmatrading.co.uk / assistant123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAssistantPassword();
