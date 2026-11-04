/**
 * MODULE TITLE: Attendance Session Details
 * Displays the specific records for a roll call session.
 */

import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, UserCheck, UserX, Clock, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AttendanceSessionDetailsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;
  const { sessionId } = await params;

  if (!lecturerId) return null;

  // Retrieve the specific attendance session
  const attendanceSession = await prisma.attendance.findUnique({
    where: { id: Number(sessionId) },
    include: {
      course: {
        include: {
          enrollments: {
            include: { student: true }
          }
        }
      },
      records: {
        include: { student: true }
      }
    }
  });

  if (!attendanceSession || attendanceSession.conductedBy !== lecturerId) {
    notFound();
  }

  // Organize students by attendance status
  const attendedStudentIds = new Set(attendanceSession.records.map(r => r.studentId));

  const allEnrolled = attendanceSession.course.enrollments.map(e => e.student);

  const attendedList = attendanceSession.records.map(r => ({
    ...r.student,
    status: r.status,
    time: r.createdAt
  }));

  const absentList = allEnrolled.filter(s => !attendedStudentIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lecturer/rollcall">
            <Button variant="outline" size="sm" className="p-2 h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Session Records</h1>
            <p className="text-xs text-slate-400 mt-1">Detailed attendance breakdown for this lecture</p>
          </div>
        </div>
        <Badge variant="success" className="px-4 py-1.5 font-bold">
          {attendedList.length} / {allEnrolled.length} Present
        </Badge>
      </div>

      {/* Session Metadata Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course unit</p>
            <h3 className="text-sm font-black text-white">{attendanceSession.course.code}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{attendanceSession.course.name}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session Date</p>
            <h3 className="text-sm font-black text-white">{format(new Date(attendanceSession.sessionDate), 'MMMM dd, yyyy')}</h3>
            <p className="text-xs text-slate-400">{format(new Date(attendanceSession.sessionDate), 'hh:mm a')}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lecture Topic</p>
            <h3 className="text-sm font-black text-white truncate max-w-[200px]">{attendanceSession.topic || 'General Session'}</h3>
          </div>
        </Card>
      </div>

      {/* Attendance Roster Table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" /> Complete Roster
        </h2>

        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Student Name</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Reg. Number</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Check-in Time</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* Present Students */}
              {attendedList.map((s) => (
                <tr key={s.id} className="text-sm group">
                  <td className="py-4 font-bold text-white">{s.firstName} {s.surname}</td>
                  <td className="py-4 font-mono text-xs text-slate-400">{s.studentId || 'N/A'}</td>
                  <td className="py-4 text-slate-500 text-xs">{format(new Date(s.time), 'hh:mm:ss a')}</td>
                  <td className="py-4 text-right">
                    <Badge variant="success" className="gap-1.5">
                      <UserCheck className="w-3 h-3" /> Present
                    </Badge>
                  </td>
                </tr>
              ))}

              {/* Absent Students */}
              {absentList.map((s) => (
                <tr key={s.id} className="text-sm group opacity-60">
                  <td className="py-4 font-bold text-slate-400">{s.firstName} {s.surname}</td>
                  <td className="py-4 font-mono text-xs text-slate-500">{s.studentId || 'N/A'}</td>
                  <td className="py-4 text-slate-600 text-xs italic">Did not check-in</td>
                  <td className="py-4 text-right">
                    <Badge variant="danger" className="gap-1.5 opacity-80">
                      <UserX className="w-3 h-3" /> Absent
                    </Badge>
                  </td>
                </tr>
              ))}

              {allEnrolled.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 italic">
                    No students enrolled in this course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
