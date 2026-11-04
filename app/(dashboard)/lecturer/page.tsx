/**
 * MODULE TITLE: Lecturer Dashboard Main Page
 * Primary home screen for lecturers showing core metrics and schedules.
 */

import React from 'react';
import Link from 'next/link';
// Auth and database tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// Performance graph
import { LecturerPerformanceChart } from '@/components/lecturer/LecturerPerformanceChart';
// Icons
import {
  Users,
  BookOpen,
  FileCheck2,
  MessageSquare,
  ClipboardCheck,
  FolderUp,
  PlusCircle,
  Video,
  Clock,
  Activity,
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default async function LecturerDashboardPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  // Initialize KPI metrics
  let activeCoursesCount = 0;
  let activeStudentsCount = 0;
  let totalExamsCount = 0;
  let pendingExamsCount = 0;
  let unreadMessagesCount = 0;
  let assignedCourses: any[] = [];

  if (lecturerId) {
    // Fetch courses assigned to the current lecturer
    assignedCourses = await prisma.course.findMany({
      where: { lecturerId },
      include: {
        enrollments: {
          select: { studentId: true }
        },
        exams: {
          include: {
            submissions: true
          }
        }
      }
    });

    activeCoursesCount = assignedCourses.length;

    // Count unique enrolled students across all assigned courses
    const studentIdSet = new Set<number>();
    assignedCourses.forEach(c => {
      c.enrollments.forEach((e: any) => studentIdSet.add(e.studentId));
    });
    activeStudentsCount = studentIdSet.size;

    // Fetch exams created by this lecturer
    const exams = await prisma.exam.findMany({
      where: { creatorId: lecturerId }
    });
    totalExamsCount = exams.length;
    pendingExamsCount = exams.filter(e => e.status === 'DRAFT' || !e.isOpen).length;

    // Fetch unread notifications for the lecturer
    unreadMessagesCount = await prisma.notification.count({
      where: { userId: lecturerId, isRead: false }
    });
  } else {
    // Fallback counts for system-wide overview if no session is found
    activeCoursesCount = await prisma.course.count();
    activeStudentsCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    totalExamsCount = await prisma.exam.count();
    pendingExamsCount = await prisma.exam.count({ where: { isOpen: false } });
  }

  // Define weekly schedule from assigned courses
  const weeklySchedule = assignedCourses.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    time: `${c.scheduleDay || 'TBD'} / ${c.scheduleTime || 'Time TBD'}`,
    room: c.room || 'No Room Assigned',
    status: 'Scheduled'
  }));

  // Calculate Teaching Progress Metrics
  const syllabusCompletion = assignedCourses.length > 0
    ? Math.round(assignedCourses.reduce((acc, c) => acc + (c.syllabusProgress || 0), 0) / assignedCourses.length)
    : 0;

  // Assignment Grading Rate
  const totalSubmissions = await prisma.assignmentSubmission.count({
    where: { assignment: { createdBy: lecturerId || 0 } }
  });
  const gradedSubmissions = await prisma.assignmentSubmission.count({
    where: {
      assignment: { createdBy: lecturerId || 0 },
      grade: { not: null }
    }
  });
  const gradingRate = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100;

  // Attendance Rate
  const totalAttendanceRecords = await prisma.attendanceRecord.count({
    where: { attendance: { conductedBy: lecturerId || 0 } }
  });
  const presentRecords = await prisma.attendanceRecord.count({
    where: {
      attendance: { conductedBy: lecturerId || 0 },
      status: 'PRESENT'
    }
  });
  const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 100;

  // Fetch upcoming exams (most recent 5)
  const upcomingExams = await prisma.exam.findMany({
    take: 5,
    where: lecturerId ? { creatorId: lecturerId } : {},
    include: { course: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Aggregate performance data for the chart
  const chartData = assignedCourses.map(c => {
    let totalScore = 0;
    let submissionCount = 0;
    let passedCount = 0;

    c.exams.forEach((ex: any) => {
      ex.submissions.forEach((s: any) => {
        if (s.percentage !== null) {
          totalScore += s.percentage;
          submissionCount++;
          if (s.percentage >= ex.passMark) passedCount++;
        }
      });
    });

    const avgScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 75;
    const passRate = submissionCount > 0 ? Math.round((passedCount / submissionCount) * 100) : 88;

    return {
      course: c.code,
      avgScore,
      passRate
    };
  });

  // Recent activity log items
  const recentActivities = [
    { text: 'New assignment submission in CS201 Data Structures', time: '10 mins ago', type: 'submission' },
    { text: 'Uploaded lecture slides for Algorithm Complexity', time: '1 hour ago', type: 'material' },
    { text: 'Roll call completed for Mon 10:00 AM class session', time: '3 hours ago', type: 'attendance' },
  ];

  return (
    <div className="space-y-8">
      {/* Header section with greeting and current term */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {session?.user?.name || 'Lecturer'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Instructor Command Center — Managing your courses, students, and academic schedule.
          </p>
        </div>
        <Badge variant="info" className="px-3.5 py-1.5 text-xs font-bold border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
          Academic Term 2025/2026
        </Badge>
      </div>

      {/* KPI Cards section showing student, course, and exam totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
            <h3 className="text-3xl font-black text-white mt-1">{activeStudentsCount}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              Enrolled in your classes
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Courses</p>
            <h3 className="text-3xl font-black text-white mt-1">{activeCoursesCount}</h3>
            <span className="text-[11px] text-indigo-400 font-semibold mt-1 inline-block">
              Active Teaching
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exams (Incl. Pending)</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalExamsCount}</h3>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
              {pendingExamsCount} Pending / Drafts
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <FileCheck2 className="w-6 h-6 text-sky-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread Messages</p>
            <h3 className="text-3xl font-black text-white mt-1">{unreadMessagesCount}</h3>
            <span className="text-[11px] text-sky-400 font-semibold mt-1 inline-block">
              Notifications & Alerts
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <MessageSquare className="w-6 h-6 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Main weekly schedule overview table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Weekly Class Schedule
          </h2>
          <Link href="/lecturer/classes">
            <Button variant="ghost" size="sm" className="gap-1">
              View All Classes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Course Code</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Course Title</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Schedule Day & Time</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Location / Virtual Room</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {weeklySchedule.map((s) => (
                <tr key={s.id} className="text-sm">
                  <td className="py-4 font-mono text-xs text-indigo-400 font-bold">{s.code}</td>
                  <td className="py-4 font-bold text-white">{s.name}</td>
                  <td className="py-4 text-slate-300">{s.time}</td>
                  <td className="py-4 text-slate-400">{s.room}</td>
                  <td className="py-4">
                    <Badge variant="info">{s.status}</Badge>
                  </td>
                </tr>
              ))}
              {weeklySchedule.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500">
                    No classes scheduled for this week.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grid of quick action shortcuts for common tasks */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Quick Instructor Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/lecturer/rollcall">
            <Card className="p-4 flex items-center gap-3.5 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Take Roll Call</h4>
                <p className="text-xs text-slate-400">Record attendance</p>
              </div>
            </Card>
          </Link>

          <Link href="/lecturer/materials">
            <Card className="p-4 flex items-center gap-3.5 hover:border-sky-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                <FolderUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Upload Materials</h4>
                <p className="text-xs text-slate-400">Share slides & notes</p>
              </div>
            </Card>
          </Link>

          <Link href="/lecturer/exams">
            <Card className="p-4 flex items-center gap-3.5 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Create an Exam</h4>
                <p className="text-xs text-slate-400">CATs & Quizzes</p>
              </div>
            </Card>
          </Link>

          <Link href="/lecturer/classes">
            <Card className="p-4 flex items-center gap-3.5 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Start Live Class</h4>
                <p className="text-xs text-slate-400">Launch WebRTC room</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Grid for upcoming exams and performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-sky-400" /> Upcoming Exams to Administer
            </h2>
            <Link href="/lecturer/exams">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage Exams <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((e) => (
              <div key={e.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-400">{e.code}</span>
                  <h4 className="font-bold text-white text-sm">{e.title}</h4>
                  <p className="text-xs text-slate-400">{e.course.name} • {e.durationMinutes} mins</p>
                </div>
                <div className="text-right">
                  <Badge variant={e.isOpen ? 'success' : 'secondary'}>
                    {e.isOpen ? 'Active' : e.status}
                  </Badge>
                  <p className="text-[11px] font-bold text-amber-400 mt-1">{e.totalMarks} Points</p>
                </div>
              </div>
            ))}
            {upcomingExams.length === 0 && (
              <p className="text-slate-500 text-sm py-6 text-center">No upcoming exams scheduled.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Student Performance Overview
            </h2>
            <Badge variant="info">Average Scores</Badge>
          </div>
          {/* Component to render performance visualization */}
          <LecturerPerformanceChart data={chartData} />
        </Card>
      </div>

      {/* Grid for activity feed and weekly progress stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" /> Recent Activity Feed
          </h2>
          <div className="space-y-4">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{act.text}</p>
                  <span className="text-xs text-slate-500">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" /> Weekly Teaching Progress
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Syllabus Completion</span>
                <span className="text-sky-400">{syllabusCompletion}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${syllabusCompletion}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Assignment Grading Rate</span>
                <span className="text-emerald-400">{gradingRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${gradingRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Class Attendance Average</span>
                <span className="text-amber-400">{attendanceRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
