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

    const { examId, text, type, options, correctAnswer, points } = await req.json();

    if (!examId || !text) {
      return NextResponse.json({ success: false, message: 'Exam ID and Question Text are required.' }, { status: 400 });
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

    const question = await prisma.question.create({
      data: {
        examId: Number(examId),
        text: text.trim(),
        type: type || 'MULTIPLE_CHOICE',
        options: options || null,
        correctAnswer: correctAnswer || null,
        points: points ? Number(points) : 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Question added to exam successfully.',
      question,
    });
  } catch (error: any) {
    console.error('Create Question API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

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

    const { id, text, type, options, correctAnswer, points } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Question ID is required.' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { exam: true }
    });

    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 });
    }

    if (role === 'LECTURER' && question.exam.creatorId !== lecturerId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        text: text ? text.trim() : undefined,
        type: type || undefined,
        options: options || undefined,
        correctAnswer: correctAnswer || undefined,
        points: points !== undefined ? Number(points) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully.',
      question: updatedQuestion,
    });
  } catch (error: any) {
    console.error('Update Question API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Question ID is required.' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { exam: true }
    });

    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found.' }, { status: 404 });
    }

    if (role === 'LECTURER' && question.exam.creatorId !== lecturerId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await prisma.question.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error: any) {
    console.error('Delete Question API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
