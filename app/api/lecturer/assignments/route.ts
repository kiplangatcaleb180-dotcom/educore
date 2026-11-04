import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const lecturerId = Number(userObj.id);

    if (role !== 'LECTURER' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { title, description, courseId, dueDate, totalMarks } = await req.json();

    if (!title || !courseId || !dueDate) {
      return NextResponse.json({ success: false, message: 'Title, Course and Due Date are required.' }, { status: 400 });
    }

    // Verify course belongs to lecturer (unless Admin)
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    if (role === 'LECTURER' && course.lecturerId !== lecturerId) {
      return NextResponse.json({ success: false, message: 'Forbidden: You are not assigned to this course.' }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        description: description || null,
        courseId: Number(courseId),
        createdBy: lecturerId,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks ? Number(totalMarks) : 100,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully.',
      assignment,
    });
  } catch (error: any) {
    console.error('Create Assignment API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
