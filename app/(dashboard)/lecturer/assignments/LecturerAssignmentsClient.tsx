'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Plus,
  X,
  Calendar as CalendarIcon,
  ArrowRight,
  ClipboardList,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

interface Course {
  id: number;
  code: string;
  name: string;
}

interface Assignment {
  id: number;
  title: string;
  course: { code: string; name: string };
  totalMarks: number;
  dueDate: Date;
  _count: { submissions: number };
}

export default function LecturerAssignmentsClient({
  courses,
  initialAssignments
}: {
  courses: Course[],
  initialAssignments: Assignment[]
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd'T'23:59"));
  const [totalMarks, setTotalMarks] = useState(100);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !dueDate) return;

    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: Number(courseId),
          title,
          description,
          dueDate,
          totalMarks: Number(totalMarks)
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        setCourseId('');
        router.refresh();
      } else {
        alert('Failed to create assignment');
      }
    } catch (err) {
      alert('Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight text-amber-400">Assignment Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Manage coursework assignments and review student submissions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="px-3 py-1">
            {initialAssignments.length} Assignments
          </Badge>
          <Button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-700 gap-2">
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Course</th>
                <th>Marks</th>
                <th>Due Date</th>
                <th>Submissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialAssignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{a.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-slate-300 font-semibold">{a.course.code}</span>
                  </td>
                  <td className="font-bold text-slate-200">{a.totalMarks} pts</td>
                  <td>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(a.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td>
                    <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {a._count.submissions} Submissions
                    </Badge>
                  </td>
                  <td>
                    <Link href={`/lecturer/grades?search=${encodeURIComponent(a.title)}`}>
                      <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto">
                        Review <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {initialAssignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    <ClipboardList className="w-10 h-10 mx-auto opacity-10 mb-4" />
                    No course assignments created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-6 relative border-amber-500/30">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">New Course Assignment</h2>
              <p className="text-xs text-slate-400 mt-1">Provide instructions and set a deadline for your students.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                >
                  <option value="">Choose Unit...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assignment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mini Project: System Analysis"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter assignment requirements..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !courseId}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? 'Creating...' : 'Post Assignment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
