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

    const { departmentId, studentId } = await req.json();

    if (!departmentId || !studentId) {
      return NextResponse.json({ success: false, message: 'Department and Registration Number are required.' }, { status: 400 });
    }

    const userId = Number((session.user as any).id);

    // Check if studentId is already taken by another user
    const existingUser = await prisma.user.findFirst({
        where: {
            studentId: studentId.trim(),
            NOT: { id: userId }
        }
    });

    if (existingUser) {
        return NextResponse.json({ success: false, message: 'This registration number is already in use.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        departmentId: Number(departmentId),
        studentId: studentId.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Student Setup API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
