import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { StudentRoomClient } from './StudentRoomClient';

export default async function StudentRoomPage({
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
  const studentId = userObj?.id ? Number(userObj.id) : 0;
  const role = (userObj?.role || '').toUpperCase();

  if (!studentId) {
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
  const enrollment = !hasAdministrativeAccess && liveClass
    ? await prisma.courseEnrollment.findUnique({
        where: { courseId_studentId: { courseId: liveClass.courseId, studentId } },
        select: { status: true },
      })
    : null;

  if (!liveClass || liveClass.status !== 'ACTIVE' || (!hasAdministrativeAccess && enrollment?.status !== 'ENROLLED')) {
    redirect('/student/live-classes');
  }

  return (
    <StudentRoomClient
      liveClass={{
        id: liveClass.id,
        title: liveClass.title,
        course: liveClass.course,
        lecturer: liveClass.lecturer,
      }}
      participantName={session?.user?.name || 'Student'}
    />
  );
}
