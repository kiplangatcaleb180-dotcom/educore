// Student Attendance Tracking: Detailed record of attendance history.
import React from 'react';
// Database client
import prisma from '@/lib/prisma';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Icons
import { ClipboardCheck } from 'lucide-react';

export default async function StudentAttendancePage() {
  // Fetch all attendance sessions with related course info
  const sessions = await prisma.attendance.findMany({
    include: { course: true },
    orderBy: { sessionDate: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header section with page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Attendance Record</h1>
          <p className="text-xs text-slate-400 mt-1">Check-in history and lecture attendance percentages</p>
        </div>
        <Badge variant="success" className="px-3 py-1">
          Attendance Record
        </Badge>
      </div>

      {/* Main attendance listing table */}
      <Card className="p-6">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Course</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Lecture Topic</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.map((s) => (
                <tr key={s.id} className="text-sm">
                  <td className="py-4 text-slate-300 font-bold">{new Date(s.sessionDate).toLocaleDateString()}</td>
                  <td className="py-4 font-bold text-white">{s.course.name} ({s.course.code})</td>
                  <td className="py-4 text-slate-300">{s.topic || 'Lecture Session'}</td>
                  <td className="py-4"><Badge variant="success">Present</Badge></td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    No attendance records logged yet.
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
