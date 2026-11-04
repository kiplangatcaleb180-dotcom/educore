/**
 * MODULE TITLE: Lecturer Exams Page
 * Hub for managing examinations, tracking submissions, and creating new assessments.
 */

import React from 'react';
// Database tool
import prisma from '@/lib/prisma';
// Authentication and session tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Client component for exam management
import LecturerExamsClient from './LecturerExamsClient';

export default async function LecturerExamsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  // Parallel database fetch for lecturer-specific exams and courses
  const [exams, courses] = await Promise.all([
    // Retrieve all exams created by the lecturer with related counts
    prisma.exam.findMany({
      where: { creatorId: lecturerId },
      include: {
        course: { select: { code: true, name: true } },
        _count: { select: { questions: true, submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Retrieve courses taught by the lecturer to allow new exam creation
    prisma.course.findMany({
      where: { lecturerId },
      select: { id: true, code: true, name: true }
    })
  ]);

  return (
    <LecturerExamsClient
      courses={courses as any}
      initialExams={exams as any}
    />
  );
}
