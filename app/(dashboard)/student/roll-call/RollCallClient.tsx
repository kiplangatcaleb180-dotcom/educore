'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Session {
  id: number;
  topic: string | null;
  sessionDate: Date;
  course: { code: string; name: string };
}

interface Record {
  id: number;
  status: string;
  createdAt: Date;
  attendance: {
    sessionDate: Date;
    topic: string | null;
    course: { code: string; name: string };
  };
}

export default function RollCallClient({
  availableSessions,
  history
}: {
  availableSessions: Session[],
  history: Record[]
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  const handleCheckIn = async (attendanceId: number) => {
    setLoadingId(attendanceId);
    try {
      const res = await fetch('/api/student/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Check-in failed');
      }
    } catch (err) {
      alert('Error during check-in');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return <Badge variant="success">Present</Badge>;
      case 'ABSENT': return <Badge variant="danger">Absent</Badge>;
      case 'LATE': return <Badge variant="warning">Late</Badge>;
      case 'EXCUSED': return <Badge variant="info">Excused</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Sessions for Check-in */}
      {availableSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> Active Sessions (Check-in Required)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSessions.map((s) => (
              <Card key={s.id} className="p-5 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{s.course.code}</span>
                    <h3 className="font-bold text-white mt-1">{s.course.name}</h3>
                    <p className="text-sm text-slate-400 mt-2 italic">Topic: {s.topic || 'General Lecture'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCheckIn(s.id)}
                    disabled={loadingId === s.id}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loadingId === s.id ? 'Checking in...' : 'Mark Present'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" /> Attendance History
        </h2>
        <Card className="p-6 overflow-hidden">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-200 font-semibold">{format(new Date(r.attendance.sessionDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-white text-sm">{r.attendance.course.code}</p>
                        <p className="text-[10px] text-slate-500">{r.attendance.course.name}</p>
                      </div>
                    </td>
                    <td className="text-slate-400 italic text-sm">
                      {r.attendance.topic || 'N/A'}
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td className="text-[10px] font-mono text-slate-500 uppercase">
                      {format(new Date(r.createdAt), 'hh:mm a')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-500 italic">
                      No roll call records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
