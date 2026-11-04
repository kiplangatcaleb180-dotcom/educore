import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { id } = await params;
    const notificationId = Number(id);

    const notification = await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Read Notification API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
