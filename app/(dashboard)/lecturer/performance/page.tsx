import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LecturerPerformanceClient from './LecturerPerformanceClient';

export default async function LecturerPerformanceAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  // 1. Fetch courses assigned to this lecturer
  const courses = await prisma.course.findMany({
    where: { lecturerId },
    include: {
      exams: {
        include: { submissions: true }
      },
      _count: { select: { enrollments: true } }
    }
  });

  // 2. Fetch all unique students enrolled in lecturer's units
  const enrolledStudents = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      enrollments: { some: { course: { lecturerId } } }
    },
    select: {
      id: true,
      firstName: true,
      surname: true,
      studentId: true,
      _count: { select: { enrollments: { where: { course: { lecturerId } } } } }
    },
    take: 50 // Limit for initial list
  });

  let totalScoreSum = 0;
  let totalSubmissions = 0;

  const chartData = courses.map(c => {
    let courseTotalScore = 0;
    let courseSubmissionCount = 0;
    let passedCount = 0;

    c.exams.forEach((ex: any) => {
      ex.submissions.forEach((s: any) => {
        if (s.percentage !== null) {
          courseTotalScore += s.percentage;
          courseSubmissionCount++;
          if (s.percentage >= ex.passMark) passedCount++;

          totalScoreSum += s.percentage;
          totalSubmissions++;
        }
      });
    });

    const avgScore = courseSubmissionCount > 0 ? Math.round(courseTotalScore / courseSubmissionCount) : 0;
    const passRate = courseSubmissionCount > 0 ? Math.round((passedCount / courseSubmissionCount) * 100) : 0;

    return {
      course: c.code,
      avgScore,
      passRate
    };
  });

  const stats = {
    totalStudents: enrolledStudents.length,
    avgScore: totalSubmissions > 0 ? Math.round(totalScoreSum / totalSubmissions) : 0
  };

  const formattedStudents = enrolledStudents.map(s => ({
    id: s.id,
    firstName: s.firstName,
    surname: s.surname,
    studentId: s.studentId,
    coursesCount: s._count.enrollments
  }));

  return (
    <LecturerPerformanceClient
      chartData={chartData}
      students={formattedStudents}
      stats={stats}
    />
  );
}
