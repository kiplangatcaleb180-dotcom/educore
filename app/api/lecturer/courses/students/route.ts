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
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Course ID is required' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: { some: { courseId: Number(courseId) } },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        role: true,
        avatar: true,
        studentId: true,
      },
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.surname}`,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      studentId: u.studentId
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error('Fetch Course Students API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
