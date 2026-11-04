import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    const userId = Number((session.user as any).id);

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { firstName: { contains: query } },
          { surname: { contains: query } },
          { email: { contains: query } },
        ],
        isActive: true,
        isBlocked: false,
      },
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        role: true,
        avatar: true,
      },
      take: 10,
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.surname}`,
      email: u.email,
      role: u.role,
      avatar: u.avatar
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error('Search Users API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
