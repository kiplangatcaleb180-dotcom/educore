/**
 * MODULE TITLE: Lecturer Roll Call (Attendance) Page
 * Entry point for managing class attendance sessions.
 */

import React from 'react';
// Database tool
import prisma from '@/lib/prisma';
// Authentication and session tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Client component for attendance interaction
import LecturerRollCallClient from './LecturerRollCallClient';

export const dynamic = 'force-dynamic';

export default async function LecturerRollcallPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  // Parallel database fetch for past sessions and active courses
  const [sessions, courses] = await Promise.all([
    // Retrieve historical attendance sessions conducted by the lecturer
    prisma.attendance.findMany({
      where: { conductedBy: lecturerId },
      include: {
        course: { select: { code: true, name: true } },
        _count: { select: { records: true } },
      },
      orderBy: { sessionDate: 'desc' },
    }),
    // Retrieve courses taught by the lecturer for starting new sessions
    prisma.course.findMany({
      where: { lecturerId },
      select: { id: true, code: true, name: true }
    })
  ]);

  return (
    <LecturerRollCallClient
      courses={courses as any}
      initialSessions={sessions as any}
    />
  );
}
