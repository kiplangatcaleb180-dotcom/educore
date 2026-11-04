import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Video, Play, Users, Clock, Radio } from 'lucide-react';

export default async function StudentLiveClassesPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  // Find enrolled courses for this student
  const enrollments = await prisma.courseEnrollment.findMany({
    where: studentId ? { studentId, status: 'ENROLLED' } : {},
    select: { courseId: true },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // Query active live classes for student's enrolled courses
  const activeLiveClasses = await prisma.liveClass.findMany({
    where: {
      courseId: { in: enrolledCourseIds },
      status: 'ACTIVE',
    },
    include: {
      course: true,
      lecturer: { select: { firstName: true, surname: true } },
    },
    orderBy: { startedAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Live Campus Broadcasts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Join active live classes, view screen shares, and participate in real-time Q&A.
        </p>
      </div>

      {/* Active Live Broadcasts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Active Broadcasts for Your Enrolled Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLiveClasses.map((lc) => (
            <Card key={lc.id} className="p-6 space-y-4 border-emerald-500/40 bg-slate-900/90 hover:border-emerald-500">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{lc.course.code}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{lc.title}</h3>
                  <p className="text-xs text-slate-400">
                    Instructor: {lc.lecturer.firstName} {lc.lecturer.surname}
                  </p>
                </div>
                <Badge variant="danger" className="bg-red-500/20 text-red-400 border-red-500/30 gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE NOW
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Started {new Date(lc.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <Link href={`/student/live-room/${lc.id}`}>
                  <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                    <Play className="w-4 h-4" /> Join Class
                  </Button>
                </Link>
              </div>
            </Card>
          ))}

          {activeLiveClasses.length === 0 && (
            <Card className="p-8 text-center col-span-3 text-slate-400 space-y-2">
              <Video className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No Live Broadcasts Right Now</h3>
              <p className="text-xs text-slate-500">
                When your lecturers launch a live stream for your enrolled subjects, active classes will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
