import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'LECTURER') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, response } = await req.json();

    if (!id || !status || !response) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        status,
        response,
      },
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: consultation.studentId,
        title: `Consultation Request ${status === 'APPROVED' ? 'Accepted' : 'Declined'}`,
        message: `Your lecturer has responded to your consultation request: ${response.slice(0, 100)}...`,
        type: status === 'APPROVED' ? 'success' : 'warning',
      },
    });

    return NextResponse.json({ success: true, consultation });
  } catch (error) {
    console.error('Consultation response error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
