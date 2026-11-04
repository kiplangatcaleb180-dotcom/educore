import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    // Fetch conversations where user is a participant
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              include: { user: { select: { id: true, firstName: true, surname: true, avatar: true, role: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: 'desc' } }
    });

    const formattedConversations = conversations.map(cp => {
      const otherParticipant = cp.conversation.participants[0]?.user;
      const lastMessage = cp.conversation.messages[0];

      return {
        id: cp.conversation.id,
        type: cp.conversation.type,
        title: otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.surname}` : 'Unknown User',
        avatar: otherParticipant?.avatar || null,
        role: otherParticipant?.role || 'STUDENT',
        lastMessage: lastMessage?.content || 'No messages yet',
        updatedAt: cp.conversation.updatedAt,
        otherUserId: otherParticipant?.id || null
      };
    });

    return NextResponse.json({ success: true, conversations: formattedConversations });
  } catch (error: any) {
    console.error('Fetch Conversations API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
