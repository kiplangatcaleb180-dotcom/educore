import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    const courses = await prisma.course.findMany({
      where: { lecturerId: userId },
      select: { id: true, code: true, name: true }
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('Fetch Lecturer Courses Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
