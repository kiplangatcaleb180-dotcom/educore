import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LecturerGradesClient from './LecturerGradesClient';

export default async function LecturerGradesPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  // 1. Fetch Exam Submissions
  const examSubmissions = await prisma.submission.findMany({
    where: {
      exam: { creatorId: lecturerId }
    },
    include: {
      student: { select: { firstName: true, surname: true, studentId: true } },
      exam: { include: { course: true } }
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch Assignment Submissions
  const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
    where: {
      assignment: { createdBy: lecturerId }
    },
    include: {
      student: { select: { firstName: true, surname: true, studentId: true } },
      assignment: { include: { course: true } }
    },
    orderBy: { submittedAt: 'desc' },
  });

  // 3. Normalize into a single structure
  const allSubmissions: any[] = [
    ...examSubmissions.map(s => ({
      id: s.id,
      type: 'EXAM',
      title: s.exam.title,
      courseCode: s.exam.course.code,
      studentName: `${s.student.firstName} ${s.student.surname}`,
      studentId: s.student.studentId,
      score: s.score,
      maxMarks: s.exam.totalMarks,
      grade: s.grade,
      status: s.status,
      feedback: s.feedback,
      createdAt: s.createdAt
    })),
    ...assignmentSubmissions.map(s => ({
      id: s.id,
      type: 'ASSIGNMENT',
      title: s.assignment.title,
      courseCode: s.assignment.course.code,
      studentName: `${s.student.firstName} ${s.student.surname}`,
      studentId: s.student.studentId,
      score: s.grade, // In schema, assignment grade is stored in 'grade' field
      maxMarks: s.assignment.totalMarks,
      grade: null,
      status: s.grade !== null ? 'GRADED' : 'SUBMITTED',
      feedback: s.feedback,
      createdAt: s.submittedAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <LecturerGradesClient initialSubmissions={allSubmissions as any} />
  );
}
