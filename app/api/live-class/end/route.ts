import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLiveClassRoomName, getLiveKitHttpUrl, isLiveKitConfigured, liveKitConfig } from '@/lib/livekit';
import prisma from '@/lib/prisma';
import { RoomServiceClient } from 'livekit-server-sdk';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const userId = Number(userObj.id);

    const { classId } = await req.json();

    if (!classId) {
      return NextResponse.json({ success: false, message: 'Class ID is required.' }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: Number(classId) },
      include: { course: true },
    });

    if (!liveClass) {
      return NextResponse.json({ success: false, message: 'Live class not found.' }, { status: 404 });
    }

    const isAuthorized =
      role === 'ADMIN' ||
      role === 'SUPERADMIN' ||
      liveClass.lecturerId === userId ||
      liveClass.course?.lecturerId === userId;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not authorized to end this live class.' },
        { status: 403 }
      );
    }

    const endedAt = new Date();
    const startedAt = new Date(liveClass.startedAt);
    const sessionDurationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    await prisma.liveClass.update({
      where: { id: Number(classId) },
      data: {
        status: 'ENDED',
        endedAt: endedAt,
      },
    });

    // Process Attendance if session was at least 5 minutes long
    if (sessionDurationSeconds > 300) {
        const participants = await prisma.liveClassParticipant.findMany({
            where: { liveClassId: Number(classId) },
            include: { student: true }
        });

        for (const p of participants) {
            const presenceRatio = p.totalSeconds / sessionDurationSeconds;
            if (presenceRatio >= 0.75) {
                // Mark as present in LiveClassParticipant
                await prisma.liveClassParticipant.update({
                    where: { id: p.id },
                    data: { isPresent: true }
                });

                // Create general Attendance session linked to this Live Class
                let attendanceSession = await prisma.attendance.findUnique({
                    where: { liveClassId: Number(classId) }
                });

                if (!attendanceSession) {
                    attendanceSession = await prisma.attendance.create({
                        data: {
                            courseId: liveClass.courseId,
                            conductedBy: liveClass.lecturerId,
                            sessionDate: endedAt,
                            topic: `Live Class: ${liveClass.title}`,
                            liveClassId: Number(classId)
                        }
                    });
                }

                await prisma.attendanceRecord.upsert({
                    where: {
                        attendanceId_studentId: {
                            attendanceId: attendanceSession.id,
                            studentId: p.studentId
                        }
                    },
                    update: { status: 'PRESENT' },
                    create: {
                        attendanceId: attendanceSession.id,
                        studentId: p.studentId,
                        status: 'PRESENT'
                    }
                });
            }
        }
    }

    // Closing the provider room disconnects active participants immediately.
    // The database update remains authoritative if the provider is temporarily unavailable.
    if (isLiveKitConfigured()) {
      try {
        const roomService = new RoomServiceClient(
          getLiveKitHttpUrl()!,
          liveKitConfig.apiKey,
          liveKitConfig.apiSecret
        );
        await roomService.deleteRoom(getLiveClassRoomName(liveClass.id));
      } catch (providerError) {
        console.warn('LiveKit room cleanup failed:', providerError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Live Class ended successfully.',
    });
  } catch (error: any) {
    console.error('Error ending live class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to end live class.' },
      { status: 500 }
    );
  }
}
