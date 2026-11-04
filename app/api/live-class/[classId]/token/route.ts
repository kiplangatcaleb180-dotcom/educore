import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AccessToken } from 'livekit-server-sdk';
import { authOptions } from '@/lib/auth';
import { getLiveClassRoomName, getLiveKitWsUrl, isLiveKitConfigured, liveKitConfig } from '@/lib/livekit';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAdministrator(role: string) {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  const userId = Number(user?.id);
  const role = (user?.role || '').toUpperCase();

  if (!user?.id || !Number.isInteger(userId)) {
    return NextResponse.json({ success: false, message: 'Authentication is required.' }, { status: 401 });
  }

  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: 'Live classroom service is not configured. Contact your administrator.',
      },
      { status: 503 }
    );
  }

  const { classId: rawClassId } = await params;
  const classId = Number(rawClassId);
  if (!Number.isInteger(classId) || classId <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid class ID.' }, { status: 400 });
  }

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      courseId: true,
      lecturerId: true,
      status: true,
      course: { select: { lecturerId: true } },
    },
  });

  if (!liveClass || liveClass.status !== 'ACTIVE') {
    return NextResponse.json({ success: false, message: 'This live class is no longer active.' }, { status: 409 });
  }

  const isHost = liveClass.lecturerId === userId || liveClass.course.lecturerId === userId;
  const hasAdministrativeAccess = isAdministrator(role);
  let isEnrolled = false;

  if (role === 'STUDENT') {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_studentId: { courseId: liveClass.courseId, studentId: userId } },
      select: { status: true },
    });
    isEnrolled = enrollment?.status === 'ENROLLED';
  }

  if (!isHost && !hasAdministrativeAccess && !isEnrolled) {
    return NextResponse.json({ success: false, message: 'You do not have access to this live class.' }, { status: 403 });
  }

  const participantRole = isHost || hasAdministrativeAccess ? 'HOST' : 'STUDENT';

  console.log(`[LiveKit] Generating token for user-${userId} in room ${getLiveClassRoomName(liveClass.id)} as ${participantRole}`);

  const token = new AccessToken(liveKitConfig.apiKey, liveKitConfig.apiSecret, {
    identity: `user-${userId}`,
    name: user.name || `Participant ${userId}`,
    ttl: '1h',
  });

  token.addGrant({
    roomJoin: true,
    room: getLiveClassRoomName(liveClass.id),
    canSubscribe: true,
    canPublish: true,
    canPublishData: true,
    canUpdateOwnMetadata: false,
    roomAdmin: participantRole === 'HOST',
  });

  const jwt = await token.toJwt();
  const serverUrl = getLiveKitWsUrl();

  console.log(`[LiveKit] Token generated successfully. Server URL: ${serverUrl}`);

  return NextResponse.json({
    success: true,
    token: jwt,
    serverUrl,
    participantRole,
  });
}
