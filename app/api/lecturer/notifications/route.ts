import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'LECTURER') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId, title, message } = await req.json();

    if (!courseId || !title || !message) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Find all students enrolled in this course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId, status: 'ENROLLED' },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No students enrolled in this course' });
    }

    // Create notifications for all students
    const notifications = await prisma.notification.createMany({
      data: studentIds.map((studentId) => ({
        userId: studentId,
        title,
        message,
        type: 'info',
      })),
    });

    return NextResponse.json({ success: true, count: notifications.count });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
