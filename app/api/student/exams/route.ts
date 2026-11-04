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
    const studentId = Number(userObj.id);

    const { examId, answers, tabSwitches } = await req.json();

    if (!examId) {
      return NextResponse.json({ success: false, message: 'Exam ID is required.' }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: Number(examId) },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found.' }, { status: 404 });
    }

    // Calculate score for auto-gradable questions (Multiple Choice & True/False)
    let autoScore = 0;
    const totalExamMarks = exam.totalMarks || 100;

    if (answers && typeof answers === 'object') {
      exam.questions.forEach((q) => {
        // Only auto-mark Multiple Choice and True/False
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
          const studentAns = answers[q.id];
          if (studentAns && q.correctAnswer && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
            autoScore += q.points;
          }
        }
      });
    }

    const percentage = Math.round((autoScore / totalExamMarks) * 100);

    let gradeLetter = 'F';
    if (percentage >= 70) gradeLetter = 'A';
    else if (percentage >= 60) gradeLetter = 'B';
    else if (percentage >= 50) gradeLetter = 'C';
    else if (percentage >= 40) gradeLetter = 'D';

    const submission = await prisma.submission.upsert({
      where: {
        examId_studentId: {
          examId: Number(examId),
          studentId,
        },
      },
      update: {
        answers: answers || {},
        score: autoScore,
        percentage,
        grade: gradeLetter,
        tabSwitches: tabSwitches ? Number(tabSwitches) : 0,
        status: 'SUBMITTED',
      },
      create: {
        examId: Number(examId),
        studentId,
        answers: answers || {},
        score: autoScore,
        percentage,
        grade: gradeLetter,
        tabSwitches: tabSwitches ? Number(tabSwitches) : 0,
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully.',
      submission,
    });
  } catch (error: any) {
    console.error('Student Exam Submission API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
