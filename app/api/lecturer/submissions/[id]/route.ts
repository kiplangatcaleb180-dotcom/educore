import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const submissionId = Number(id);

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            firstName: true,
            surname: true,
            studentId: true,
          }
        },
        exam: {
          include: {
            questions: true,
            course: true,
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    // Check if the lecturer is the creator of the exam
    if (role === 'LECTURER' && submission.exam.creatorId !== lecturerId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: submission
    });

  } catch (error: any) {
    console.error('Fetch submission detail error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
