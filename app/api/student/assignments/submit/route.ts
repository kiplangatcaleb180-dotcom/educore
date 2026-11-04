import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const userObj = session.user as any;
  const studentId = Number(userObj.id);

  try {
    const { assignmentId, submissionText, filePath } = await req.json();

    if (!assignmentId || !submissionText) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Check if student is enrolled in the course for this assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(assignmentId) },
      include: { course: true },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 });
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: assignment.courseId,
          studentId: studentId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, message: 'You are not enrolled in this course' }, { status: 403 });
    }

    // Upsert submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: Number(assignmentId),
          studentId: studentId,
        },
      },
      update: {
        submissionText,
        filePath: filePath || null,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: Number(assignmentId),
        studentId: studentId,
        submissionText,
        filePath: filePath || null,
      },
    });

    // Notify the lecturer
    await prisma.notification.create({
      data: {
        userId: assignment.createdBy,
        title: 'New Assignment Submission',
        message: `${userObj.name} has submitted work for: ${assignment.title}`,
        type: 'info',
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Assignment submission error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
