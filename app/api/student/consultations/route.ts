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
    const { lecturerId, subject, message } = await req.json();

    if (!lecturerId || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        studentId,
        lecturerId,
        subject,
        message,
        status: 'PENDING',
      },
    });

    // Create a notification for the lecturer
    await prisma.notification.create({
      data: {
        userId: lecturerId,
        title: 'New Consultation Request',
        message: `You have a new consultation request regarding: ${subject}`,
        type: 'info',
      },
    });

    return NextResponse.json({ success: true, consultation });
  } catch (error) {
    console.error('Consultation creation error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
