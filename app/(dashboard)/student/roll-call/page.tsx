import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import RollCallClient from './RollCallClient';

export default async function StudentRollCallPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const today = new Date();

  // 1. Fetch available sessions for today (to check-in)
  const availableSessions = await prisma.attendance.findMany({
    where: {
      sessionDate: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      course: { enrollments: { some: { studentId } } },
      records: { none: { studentId } } // Sessions the student hasn't checked into yet
    },
    include: { course: true },
  });

  // 2. Fetch all past records
  const rollCalls = await prisma.attendanceRecord.findMany({
    where: { studentId },
    include: { attendance: { include: { course: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance Log (Roll Call)</h1>
        <p className="text-sm text-slate-400 mt-1">Official records of your attendance across all sessions</p>
      </div>

      <RollCallClient
        availableSessions={availableSessions as any}
        history={rollCalls as any}
      />
    </div>
  );
}
