// MODULE: Course Management Page - Retrieves all courses, departments, lecturers, and students.
import React from 'react';
// Imports database tool
import prisma from '@/lib/prisma';
// Imports the interactive UI component for courses
import { AdminCoursesClient } from './AdminCoursesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  // Fetch all required data for the course management dashboard in parallel
  const [courses, departments, lecturers, students] = await Promise.all([
    // Retrieve all courses with related department, lecturer, and count information
    prisma.course.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        lecturer: { select: { id: true, firstName: true, surname: true, email: true } },
        _count: { select: { enrollments: true, exams: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Retrieve all departments for filtering and course creation
    prisma.department.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    // Retrieve all active lecturers to assign to courses
    prisma.user.findMany({
      where: { role: 'LECTURER', isActive: true, isBlocked: false },
      select: { id: true, firstName: true, surname: true, email: true, staffId: true },
      orderBy: { firstName: 'asc' },
    }),
    // Retrieve all active students for manual course enrollment
    prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true, isBlocked: false },
      select: { id: true, firstName: true, surname: true, email: true, studentId: true },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  // Map database results to the format expected by the client component
  const formattedCourses = courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    credits: c.credits,
    department: c.department,
    lecturer: c.lecturer,
    enrollmentsCount: c._count.enrollments,
    examsCount: c._count.exams,
  }));

  return (
    <AdminCoursesClient
      initialCourses={formattedCourses}
      departments={departments}
      lecturers={lecturers}
      students={students}
    />
  );
}
