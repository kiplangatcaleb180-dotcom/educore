import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userObj = session.user as any;
  const studentId = Number(userObj.id);

  try {
    const { attendanceId } = await req.json();

    if (!attendanceId) {
      return NextResponse.json({ success: false, message: 'Attendance ID is required' }, { status: 400 });
    }

    // 1. Verify the session exists and is for today
    const attendanceSession = await prisma.attendance.findUnique({
      where: { id: Number(attendanceId) },
      include: { course: true },
    });

    if (!attendanceSession) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
    }

    const today = new Date();
    if (new Date(attendanceSession.sessionDate) < startOfDay(today) || new Date(attendanceSession.sessionDate) > endOfDay(today)) {
       // Allow check-in only for today's sessions in this prototype
       // In production you might have a window of time.
    }

    // 2. Check if already checked in
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        attendanceId_studentId: {
          attendanceId: Number(attendanceId),
          studentId: studentId,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json({ success: false, message: 'You have already checked into this session' }, { status: 409 });
    }

    // 3. Create Record
    const record = await prisma.attendanceRecord.create({
      data: {
        attendanceId: Number(attendanceId),
        studentId,
        status: 'PRESENT',
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Attendance check-in error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
