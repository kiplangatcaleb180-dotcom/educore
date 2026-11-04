import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LecturerRoomClient } from './LecturerRoomClient';

export default async function LecturerRoomPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const resolvedParams = await params;
  const classId = Number(resolvedParams.classId);

  if (isNaN(classId)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;
  const role = (userObj?.role || '').toUpperCase();

  if (!lecturerId) {
    redirect('/login');
  }

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    include: {
      course: { select: { code: true, name: true } },
      lecturer: { select: { firstName: true, surname: true } },
    },
  });

  const hasAdministrativeAccess = role === 'ADMIN' || role === 'SUPERADMIN';
  const isHost = liveClass?.lecturerId === lecturerId;

  if (!liveClass || liveClass.status !== 'ACTIVE' || (!hasAdministrativeAccess && !isHost)) {
    redirect('/lecturer/classes');
  }

  return (
    <LecturerRoomClient
      liveClass={{
        id: liveClass.id,
        title: liveClass.title,
        course: liveClass.course,
        lecturer: liveClass.lecturer,
      }}
      participantName={session?.user?.name || 'Lecturer'}
    />
  );
}
