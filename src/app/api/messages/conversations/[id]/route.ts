import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Get messages for a specific conversation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = parseInt(decoded.userId || decoded.id);
    const conversationId = parseInt(params.id);

    // Check if user is participant in this conversation
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participation) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied to this conversation' 
      }, { status: 403 });
    }

    // Get messages for this conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform data for frontend
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name,
        role: msg.sender.role
      },
      messageType: msg.messageType,
      isSystemMessage: msg.isSystemMessage,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      createdAt: msg.createdAt.toISOString()
    }));

    // Mark messages as read for this user
    await prisma.conversationParticipant.update({
      where: {
        id: participation.id
      },
      data: {
        lastReadAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      messages: transformedMessages
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch messages" 
    }, { status: 500 });
  }
}

// POST - Send a message to a conversation
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = parseInt(decoded.userId || decoded.id);
    const conversationId = parseInt(params.id);

    const { content, messageType = 'text' } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Message content is required' 
      }, { status: 400 });
    }

    // Check if user is participant in this conversation
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participation) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied to this conversation' 
      }, { status: 403 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: userId,
        content: content,
        messageType: messageType
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Update conversation last message info
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        messageType: message.messageType,
        createdAt: message.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to send message" 
    }, { status: 500 });
  }
}
