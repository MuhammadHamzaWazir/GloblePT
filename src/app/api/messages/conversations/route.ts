import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Get conversations for a user (inbox)
export async function GET(request: NextRequest) {
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

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Transform data for frontend
    const transformedConversations = conversations.map(conv => {
      const otherParticipants = conv.participants.filter(p => p.userId !== userId);
      const lastMessage = conv.messages[0];
      
      return {
        id: conv.id,
        subject: conv.subject,
        priority: conv.priority,
        isArchived: conv.isArchived,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderName: lastMessage.sender.name,
          senderId: lastMessage.senderId
        } : null,
        participants: otherParticipants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          role: p.user.role
        })),
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      conversations: transformedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch conversations" 
    }, { status: 500 });
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
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

    const { recipientId, subject, initialMessage, priority = 'normal' } = await request.json();

    if (!initialMessage) {
      return NextResponse.json({ 
        success: false, 
        message: 'Initial message is required' 
      }, { status: 400 });
    }

    let finalRecipientId = recipientId;

    // If no recipient specified, find an admin user (for customer support messages)
    if (!finalRecipientId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (!adminUser) {
        return NextResponse.json({ 
          success: false, 
          message: 'No admin users available' 
        }, { status: 500 });
      }

      finalRecipientId = adminUser.id;
    }

    // Check if conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: userId
              }
            }
          },
          {
            participants: {
              some: {
                userId: finalRecipientId
              }
            }
          }
        ]
      }
    });

    let conversation;

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          subject: subject,
          priority: priority,
          participants: {
            create: [
              {
                userId: userId,
                isAdmin: false
              },
              {
                userId: finalRecipientId,
                isAdmin: true // Admin recipient
              }
            ]
          }
        }
      });
    }

    // Create initial message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: initialMessage,
        messageType: 'text'
      }
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: initialMessage,
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        subject: conversation.subject
      },
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to create conversation" 
    }, { status: 500 });
  }
}
