import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function authorizeRoomAccess(classId: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = Number(user?.id);
  const role = (user?.role || '').toUpperCase();

  if (!user?.id || !Number.isInteger(userId)) {
    return { error: NextResponse.json({ success: false, message: 'Authentication is required.' }, { status: 401 }) };
  }

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      title: true,
      status: true,
      courseId: true,
      lecturerId: true,
      course: { select: { code: true, name: true, lecturerId: true } },
      lecturer: { select: { firstName: true, surname: true } },
    },
  });

  if (!liveClass) {
    return { error: NextResponse.json({ success: false, message: 'Class not found.' }, { status: 404 }) };
  }

  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
  const isHost = liveClass.lecturerId === userId || liveClass.course.lecturerId === userId;
  const enrollment = role === 'STUDENT'
    ? await prisma.courseEnrollment.findUnique({
        where: { courseId_studentId: { courseId: liveClass.courseId, studentId: userId } },
        select: { status: true },
      })
    : null;

  if (!isAdmin && !isHost && enrollment?.status !== 'ENROLLED') {
    return { error: NextResponse.json({ success: false, message: 'You do not have access to this live class.' }, { status: 403 }) };
  }

  return { liveClass };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId: rawClassId } = await params;
  const classId = Number(rawClassId);
  if (!Number.isInteger(classId) || classId <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid class ID.' }, { status: 400 });
  }

  const result = await authorizeRoomAccess(classId);
  if ('error' in result) return result.error;

  return NextResponse.json({
    success: true,
    liveClass: result.liveClass,
    transport: 'livekit',
  });
}

// Chat, hand raises and participant state now travel over the authenticated
// real-time room rather than an unauthenticated HTTP snapshot endpoint.
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Room events are delivered through the secure real-time connection.' },
    { status: 405 }
  );
}
