import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isLiveKitConfigured } from '@/lib/livekit';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const userId = Number(userObj.id);

    if (role !== 'LECTURER' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only lecturers can start live classes.' },
        { status: 403 }
      );
    }

    if (!isLiveKitConfigured()) {
      return NextResponse.json(
        { success: false, message: 'Live classroom service is not configured. Add the LiveKit environment variables first.' },
        { status: 503 }
      );
    }

    const { title, courseId } = await req.json();

    if (!title || !courseId) {
      return NextResponse.json(
        { success: false, message: 'Course selection and Class Title are required.' },
        { status: 400 }
      );
    }

    // Verify the lecturer owns this course (unless Admin)
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return NextResponse.json({ success: false, message: 'Selected course not found.' }, { status: 404 });
    }

    if (role === 'LECTURER' && course.lecturerId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not the assigned lecturer for this course.' },
        { status: 403 }
      );
    }

    // End any previously active live classes for this course
    await prisma.liveClass.updateMany({
      where: { courseId: Number(courseId), status: 'ACTIVE' },
      data: { status: 'ENDED', endedAt: new Date() },
    });

    // Create the new active Live Class
    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        courseId: Number(courseId),
        lecturerId: userId,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        course: true,
        lecturer: {
          select: { firstName: true, surname: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Live Class started successfully.',
      liveClass,
    });
  } catch (error: any) {
    console.error('Error starting live class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start live class.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const userId = Number(userObj.id);

    let activeClasses: any[] = [];

    if (role === 'STUDENT') {
      // Find active live classes for courses student is enrolled in
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: userId, status: 'ENROLLED' },
        select: { courseId: true },
      });
      const courseIds = enrollments.map((e) => e.courseId);

      activeClasses = await prisma.liveClass.findMany({
        where: {
          courseId: { in: courseIds },
          status: 'ACTIVE',
        },
        include: {
          course: true,
          lecturer: {
            select: { firstName: true, surname: true },
          },
        },
        orderBy: { startedAt: 'desc' },
      });
    } else {
      // For Lecturer / Admin, find active live classes
      activeClasses = await prisma.liveClass.findMany({
        where: role === 'LECTURER' ? { lecturerId: userId, status: 'ACTIVE' } : { status: 'ACTIVE' },
        include: {
          course: true,
          lecturer: {
            select: { firstName: true, surname: true },
          },
        },
        orderBy: { startedAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      activeClasses,
    });
  } catch (error: any) {
    console.error('Error fetching active live classes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live classes.' },
      { status: 500 }
    );
  }
}
