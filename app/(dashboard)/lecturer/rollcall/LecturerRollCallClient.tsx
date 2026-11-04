'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ClipboardCheck,
  Plus,
  X,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Course {
  id: number;
  code: string;
  name: string;
}

interface AttendanceSession {
  id: number;
  topic: string | null;
  sessionDate: Date;
  course: { code: string; name: string };
  _count: { records: number };
}

export default function LecturerRollCallClient({
  courses,
  initialSessions
}: {
  courses: Course[],
  initialSessions: AttendanceSession[]
}) {
  const [showModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [topic, setTopic] = useState('');
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const router = useRouter();

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !sessionDate) return;

    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: Number(courseId),
          topic,
          sessionDate
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setTopic('');
        setCourseId('');
        router.refresh();
      } else {
        alert('Failed to start session');
      }
    } catch (err) {
      alert('Error starting session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance Roll Call</h1>
          <p className="text-sm text-slate-400 mt-1">Start new lecture sessions and track student attendance in real-time</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="px-3 py-1">
            {initialSessions.length} Total Sessions
          </Badge>
          <Button onClick={() => setShowUploadModal(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" /> Start New Session
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Course</th>
                <th>Session Topic</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialSessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-bold">{format(new Date(s.sessionDate), 'MMM dd, yyyy')}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{format(new Date(s.sessionDate), 'hh:mm a')}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                       <span className="font-bold text-white">{s.course.code}</span>
                       <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{s.course.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-300 italic">{s.topic || 'General Lecture'}</td>
                  <td>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                       <Users className="w-4 h-4" /> {s._count.records} Students
                    </div>
                  </td>
                  <td>
                    <Badge variant="success">Completed</Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/lecturer/rollcall/${s.id}`)}
                      className="text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto"
                    >
                      View Records <ArrowRight className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {initialSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    <ClipboardCheck className="w-10 h-10 mx-auto opacity-10 mb-4" />
                    No attendance sessions conducted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Start Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-6 relative border-emerald-500/30">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Start Attendance Session</h2>
              <p className="text-xs text-slate-400 mt-1">This will allow students to check-in for this specific unit today.</p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">Choose Unit...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lecture Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Introduction to Networking"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Session Date & Time</label>
                <input
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !courseId}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? 'Starting...' : 'Open Check-in'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
