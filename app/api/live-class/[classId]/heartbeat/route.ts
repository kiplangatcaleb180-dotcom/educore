import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { classId: rawClassId } = await params;
    const classId = Number(rawClassId);
    const userId = Number((session.user as any).id);

    const liveClass = await prisma.liveClass.findUnique({
        where: { id: classId },
        select: { status: true }
    });

    if (!liveClass || liveClass.status !== 'ACTIVE') {
        return NextResponse.json({ success: false, message: 'Class is not active' }, { status: 410 });
    }

    const now = new Date();

    // Find or create participant record
    const participant = await prisma.liveClassParticipant.findUnique({
        where: { liveClassId_studentId: { liveClassId: classId, studentId: userId } }
    });

    if (!participant) {
        await prisma.liveClassParticipant.create({
            data: {
                liveClassId: classId,
                studentId: userId,
                lastJoinedAt: now,
                totalSeconds: 0
            }
        });
    } else {
        const lastJoined = participant.lastJoinedAt ? new Date(participant.lastJoinedAt) : now;
        const diffSeconds = Math.floor((now.getTime() - lastJoined.getTime()) / 1000);

        // Cap diffSeconds to prevent massive spikes if something goes wrong (max 2 minutes)
        const validatedDiff = Math.min(Math.max(diffSeconds, 0), 120);

        await prisma.liveClassParticipant.update({
            where: { id: participant.id },
            data: {
                totalSeconds: { increment: validatedDiff },
                lastJoinedAt: now
            }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat API Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
