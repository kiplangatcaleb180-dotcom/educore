import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/logger';

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
    const courseId = Number(id);

    // Verify course exists and belongs to this lecturer
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lecturerId: true }
    });

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    if (course.lecturerId !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { scheduleDay, scheduleTime, room, syllabusProgress } = await req.json();

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        scheduleDay: scheduleDay !== undefined ? scheduleDay : undefined,
        scheduleTime: scheduleTime !== undefined ? scheduleTime : undefined,
        room: room !== undefined ? room : undefined,
        syllabusProgress: syllabusProgress !== undefined ? Number(syllabusProgress) : undefined,
      }
    });

    await logActivity({
      userId,
      action: 'UPDATE_COURSE_SCHEDULE',
      level: 'INFO',
      meta: { courseId, scheduleDay, scheduleTime, room, syllabusProgress }
    });

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error: any) {
    console.error('Update Course Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
