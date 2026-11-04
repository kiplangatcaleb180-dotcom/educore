import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const { submissionId, assignmentSubmissionId, score, grade, feedback } = await req.json();

    if (!submissionId && !assignmentSubmissionId) {
      return NextResponse.json({ success: false, message: 'Submission ID is required.' }, { status: 400 });
    }

    if (score === undefined) {
      return NextResponse.json({ success: false, message: 'Score is required.' }, { status: 400 });
    }

    let updatedResult;

    if (submissionId) {
      const submission = await prisma.submission.findUnique({
        where: { id: Number(submissionId) },
        include: { exam: true }
      });

      if (!submission) {
        return NextResponse.json({ success: false, message: 'Exam submission not found.' }, { status: 404 });
      }

      if (role === 'LECTURER' && submission.exam.creatorId !== lecturerId) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }

      const percentage = (Number(score) / submission.exam.totalMarks) * 100;
      updatedResult = await prisma.submission.update({
        where: { id: Number(submissionId) },
        data: {
          score: Number(score),
          percentage,
          grade: grade || (percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F'),
          feedback,
          status: 'GRADED',
          gradedBy: lecturerId,
          gradedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          title: 'Exam Graded',
          message: `Your submission for ${submission.exam.title} has been graded.`,
          type: 'success',
        }
      });
    } else if (assignmentSubmissionId) {
      const sub = await prisma.assignmentSubmission.findUnique({
        where: { id: Number(assignmentSubmissionId) },
        include: { assignment: true }
      });

      if (!sub) {
        return NextResponse.json({ success: false, message: 'Assignment submission not found.' }, { status: 404 });
      }

      if (role === 'LECTURER' && sub.assignment.createdBy !== lecturerId) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }

      updatedResult = await prisma.assignmentSubmission.update({
        where: { id: Number(assignmentSubmissionId) },
        data: {
          grade: Number(score),
          feedback,
          gradedBy: lecturerId,
        },
      });

      await prisma.notification.create({
        data: {
          userId: sub.studentId,
          title: 'Assignment Graded',
          message: `Your assignment "${sub.assignment.title}" has been graded.`,
          type: 'success',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Graded successfully.',
      data: updatedResult,
    });
  } catch (error: any) {
    console.error('Grade Submission API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
