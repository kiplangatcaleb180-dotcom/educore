import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const senderId = Number((session.user as any).id);
    const { recipientId, conversationId, content } = await req.json();

    if (!content) {
      return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 });
    }

    let activeConversationId = conversationId;

    // If no conversationId, check if a direct conversation already exists or create a new one
    if (!activeConversationId && recipientId) {
      const targetRecipientId = Number(recipientId);

      // Check for existing direct conversation between these two specific users
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: { userId: { in: [senderId, targetRecipientId] } }
          }
        },
        include: { _count: { select: { participants: true } } }
      });

      // Prisma 'every' can be tricky, ensure it has exactly 2 participants
      if (existingConversation && existingConversation._count.participants === 2) {
        activeConversationId = existingConversation.id;
      } else {
        // Create new conversation
        const newConvo = await prisma.conversation.create({
          data: {
            type: 'DIRECT',
            participants: {
              create: [
                { userId: senderId },
                { userId: targetRecipientId }
              ]
            }
          }
        });
        activeConversationId = newConvo.id;
      }
    }

    if (!activeConversationId) {
      return NextResponse.json({ success: false, message: 'Conversation or Recipient ID required' }, { status: 400 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: { select: { firstName: true, surname: true, avatar: true } }
      }
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: activeConversationId },
      data: { updatedAt: new Date() }
    });

    // Create notification for the recipient(s)
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: activeConversationId, userId: { not: senderId } },
      select: { userId: true }
    });

    if (participants.length > 0) {
      await prisma.notification.createMany({
        data: participants.map(p => ({
          userId: p.userId,
          title: 'New Message',
          message: `${session.user?.name} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          type: 'message'
        }))
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.surname}`,
        senderAvatar: message.sender.avatar,
        isMe: true,
        conversationId: activeConversationId
      }
    });
  } catch (error: any) {
    console.error('Send Message API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
