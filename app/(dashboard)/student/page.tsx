// Student Dashboard Overview: Statistics and progress summary for students.
import React from 'react';
import Link from 'next/link';
// Imports database and auth tools
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Icons
import {
  BookOpen,
  FileCheck2,
  FileText,
  FolderDown,
  Trophy,
  Clock,
  Activity,
  TrendingUp,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
// Specialized dashboard widgets
import {
  TodaySchedule,
  RecentMaterials,
  UpcomingAssignments,
  WeeklyProgress,
  AttendanceOverview,
  CoursePerformance,
  Achievements
} from '@/components/student/DashboardWidgets';
// Performance graph
import { StudentPerformanceChart } from '@/components/student/StudentPerformanceChart';
// Date utilities
import { differenceInDays, format, startOfDay, endOfDay } from 'date-fns';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  // Ensure student is authenticated
  if (!studentId) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to view your dashboard.
      </div>
    );
  }

  // Fetch student-specific metrics in parallel
  const [user, coursesCount, examsCount, assignmentsCount, materialsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.courseEnrollment.count({ where: { studentId } }),
    prisma.exam.count({
      where: {
        isOpen: true,
        course: { enrollments: { some: { studentId } } }
      }
    }),
    prisma.assignment.count({
      where: { course: { enrollments: { some: { studentId } } } }
    }),
    prisma.material.count({
      where: { course: { enrollments: { some: { studentId } } } }
    }),
  ]);

  // Key Performance Indicators for the dashboard
  const kpis = [
    { label: 'Enrolled Courses', value: coursesCount, icon: <BookOpen className="w-6 h-6 text-emerald-400" /> },
    { label: 'Available Exams', value: examsCount, icon: <FileCheck2 className="w-6 h-6 text-sky-400" /> },
    { label: 'Due Assignments', value: assignmentsCount, icon: <FileText className="w-6 h-6 text-amber-400" /> },
    { label: 'Study Resources', value: materialsCount, icon: <FolderDown className="w-6 h-6 text-indigo-400" /> },
  ];

  // Fetch and format today's live classes
  const today = new Date();
  const liveClasses = await prisma.liveClass.findMany({
    where: {
      course: { enrollments: { some: { studentId } } },
      startedAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    },
    include: { course: true },
  });

  const scheduleItems = liveClasses.map(lc => ({
    type: 'Live Class',
    title: lc.title,
    time: format(lc.startedAt, 'hh:mm a'),
    location: 'Virtual Room',
    status: lc.status === 'ACTIVE' ? 'Ongoing' : 'Scheduled',
  }));

  // Fetch most recent study materials
  const recentMaterialsData = await prisma.material.findMany({
    where: { course: { enrollments: { some: { studentId } } } },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { course: true },
  });

  const recentMaterials = recentMaterialsData.map(m => ({
    title: m.title,
    courseCode: m.course.code,
    url: m.filePath,
  }));

  // Fetch upcoming assignments sorted by deadline
  const upcomingAssignmentsData = await prisma.assignment.findMany({
    where: { course: { enrollments: { some: { studentId } } }, dueDate: { gte: new Date() } },
    take: 3,
    orderBy: { dueDate: 'asc' },
    include: { course: true },
  });

  const upcomingAssignments = upcomingAssignmentsData.map(a => ({
    title: a.title,
    courseName: a.course.name,
    daysLeft: differenceInDays(a.dueDate, new Date()),
  }));

  // Summarize attendance records
  const attendanceRecords = await prisma.attendanceRecord.groupBy({
    by: ['status'],
    where: { studentId },
    _count: true,
  });

  const attStats = {
    present: attendanceRecords.find(r => r.status === 'PRESENT')?._count || 0,
    absent: attendanceRecords.find(r => r.status === 'ABSENT')?._count || 0,
    late: attendanceRecords.find(r => r.status === 'LATE')?._count || 0,
  };

  // Prepare exam submission data for trend chart
  const submissions = await prisma.submission.findMany({
    where: { studentId },
    include: { exam: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  const performanceData = submissions.map(s => ({
    name: s.exam.code,
    score: Math.round(s.percentage || 0),
  })).reverse();

  // Achievement list (placeholder)
  const achievements = [
    { title: 'Top Performer', icon: <Trophy className="w-8 h-8" /> },
    { title: 'Perfect Attendance', icon: <CheckCircle2 className="w-8 h-8" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.firstName || 'Student'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your academic journey and stay on top of your studies.
          </p>
        </div>
        <Badge variant="info" className="px-3.5 py-1.5 text-xs font-bold border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
          Semester 1, 2025/2026
        </Badge>
      </div>

      {/* Grid for top-level summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/student/courses" className="block">
          <Card className="p-5 flex items-center justify-between hover:border-emerald-500/30 transition-all group">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400">Enrolled Courses</p>
              <h3 className="text-3xl font-black text-white mt-1">{coursesCount}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
          </Card>
        </Link>

        <Link href="/student/exams" className="block">
          <Card className="p-5 flex items-center justify-between hover:border-sky-500/30 transition-all group">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-sky-400">Available Exams</p>
              <h3 className="text-3xl font-black text-white mt-1">{examsCount}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <FileCheck2 className="w-6 h-6 text-sky-400" />
            </div>
          </Card>
        </Link>

        <Link href="/student/assignments" className="block">
          <Card className="p-5 flex items-center justify-between hover:border-amber-500/30 transition-all group">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-400">Due Assignments</p>
              <h3 className="text-3xl font-black text-white mt-1">{assignmentsCount}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
          </Card>
        </Link>

        <Link href="/student/materials" className="block">
          <Card className="p-5 flex items-center justify-between hover:border-indigo-500/30 transition-all group">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-400">Study Resources</p>
              <h3 className="text-3xl font-black text-white mt-1">{materialsCount}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <FolderDown className="w-6 h-6 text-indigo-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Main dashboard widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Daily schedule and upcoming assignments */}
            <TodaySchedule items={scheduleItems} />
            <UpcomingAssignments items={upcomingAssignments} />
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance Trend
              </h2>
              <Link href="/student/performance">
                <Badge variant="info" className="hover:bg-sky-500/20 cursor-pointer transition-colors">View Detailed Analytics</Badge>
              </Link>
            </div>
            {/* Performance trend chart */}
            <StudentPerformanceChart data={performanceData.length > 0 ? performanceData : [
              { name: 'Start', score: 0 },
              { name: 'Now', score: 0 }
            ]} />
          </Card>
        </div>

        <div className="space-y-8">
          {/* Progress and status overview widgets */}
          <WeeklyProgress percentage={65} />
          <AttendanceOverview {...attStats} />
          <CoursePerformance gpa={user?.overallGPA || 0} credits={user?.creditsEarned || 0} />
        </div>
      </div>

      {/* Bottom section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {/* Latest study resources */}
          <RecentMaterials items={recentMaterials} />
        </div>
        <div className="lg:col-span-2">
          {/* Academic achievements list */}
          <Achievements items={achievements} />
        </div>
      </div>
    </div>
  );
}
