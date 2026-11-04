import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
