import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST: Create Exam / CAT
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

    const { title, courseId, type, durationMinutes, totalMarks, passMark } = await req.json();

    if (!title || !courseId) {
      return NextResponse.json({ success: false, message: 'Title and Course selection are required.' }, { status: 400 });
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

    const code = `EXAM-${course.code}-${Date.now().toString().slice(-6)}`;

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        code,
        type: type || 'CAT',
        courseId: Number(courseId),
        creatorId: lecturerId,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
        totalMarks: totalMarks ? Number(totalMarks) : 100,
        passMark: passMark ? Number(passMark) : 50,
        status: 'PUBLISHED',
        isOpen: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exam created and published successfully.',
      exam,
    });
  } catch (error: any) {
    console.error('Create Exam API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH: Toggle Open/Close Exam
export async function PATCH(req: Request) {
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

    const { examId, isOpen } = await req.json();

    if (!examId) {
      return NextResponse.json({ success: false, message: 'Exam ID is required.' }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: Number(examId) },
    });

    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found.' }, { status: 404 });
    }

    if (role === 'LECTURER' && exam.creatorId !== lecturerId) {
      return NextResponse.json({ success: false, message: 'Forbidden: You are not the creator of this exam.' }, { status: 403 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: Number(examId) },
      data: {
        isOpen: typeof isOpen === 'boolean' ? isOpen : !exam.isOpen,
        status: (typeof isOpen === 'boolean' ? isOpen : !exam.isOpen) ? 'PUBLISHED' : 'COMPLETED',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Exam status updated to ${updatedExam.isOpen ? 'OPEN' : 'CLOSED'}.`,
      exam: updatedExam,
    });
  } catch (error: any) {
    console.error('Toggle Exam API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
