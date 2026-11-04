import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LecturerAssignmentsClient from './LecturerAssignmentsClient';

export default async function LecturerAssignmentsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  const [assignments, courses] = await Promise.all([
    prisma.assignment.findMany({
      where: { createdBy: lecturerId },
      include: {
        course: { select: { code: true, name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.course.findMany({
      where: { lecturerId },
      select: { id: true, code: true, name: true }
    })
  ]);

  return (
    <LecturerAssignmentsClient
      courses={courses as any}
      initialAssignments={assignments as any}
    />
  );
}
