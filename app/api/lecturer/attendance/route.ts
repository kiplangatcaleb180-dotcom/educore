import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'LECTURER') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const lecturerId = Number((session.user as any).id);

  try {
    const { courseId, topic, sessionDate } = await req.json();

    if (!courseId || !sessionDate) {
      return NextResponse.json({ success: false, message: 'Course and Date are required' }, { status: 400 });
    }

    const attendanceSession = await prisma.attendance.create({
      data: {
        courseId: Number(courseId),
        conductedBy: lecturerId,
        topic: topic || 'General Lecture',
        sessionDate: new Date(sessionDate),
      },
    });

    return NextResponse.json({ success: true, session: attendanceSession });
  } catch (error) {
    console.error('Attendance session creation error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
