'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FileCheck2,
  Plus,
  X,
  Settings,
  ArrowRight,
  MoreVertical,
  Clock,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: number;
  code: string;
  name: string;
}

interface Exam {
  id: number;
  title: string;
  code: string;
  type: string;
  course: { code: string; name: string };
  durationMinutes: number;
  totalMarks: number;
  isOpen: boolean;
  status: string;
  _count: { questions: number; submissions: number };
}

export default function LecturerExamsClient({
  courses,
  initialExams
}: {
  courses: Course[],
  initialExams: Exam[]
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('CAT');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(30);
  const [passMark, setPassMark] = useState(15);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title) return;

    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: Number(courseId),
          title,
          type,
          durationMinutes: Number(duration),
          totalMarks: Number(totalMarks),
          passMark: Number(passMark)
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setCourseId('');
        router.refresh();
      } else {
        alert('Failed to create exam');
      }
    } catch (err) {
      alert('Error creating exam');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (examId: number, currentOpen: boolean) => {
    try {
      const res = await fetch('/api/lecturer/exams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, isOpen: !currentOpen }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight text-indigo-400">CATs & Exam Management</h1>
          <p className="text-sm text-slate-400 mt-1">Create, manage, and publish online CATs and examinations</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="px-3 py-1">
            {initialExams.length} Exams Created
          </Badge>
          <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Exam / CAT
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title / Course</th>
                <th>Type</th>
                <th>Questions</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialExams.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                      {e.code}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{e.title}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">{e.course.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={e.type === 'CAT' ? 'info' : 'secondary'} className="text-[10px]">{e.type}</Badge>
                  </td>
                  <td className="text-slate-300 font-bold">{e._count.questions} Qs</td>
                  <td className="text-emerald-400 font-bold">{e._count.submissions}</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(e.id, e.isOpen)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize transition-all ${e.isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${e.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      {e.isOpen ? 'Active' : 'Draft / Closed'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/lecturer/exams/${e.id}/questions`}>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] gap-1 font-bold">
                          <Settings className="w-3 h-3" /> Questions
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8 text-slate-500">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialExams.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 italic">
                    <FileCheck2 className="w-10 h-10 mx-auto opacity-10 mb-4" />
                    No examinations created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-6 relative border-indigo-500/30 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Create New Assessment</h2>
              <p className="text-xs text-slate-400 mt-1">Setup an automated online exam or CAT for your students.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Unit</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choose Unit...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CAT">Continuous Assessment (CAT)</option>
                    <option value="SAT">Final Examination (SAT)</option>
                    <option value="QUIZ">Short Quiz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assessment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., CAT 1: Fundamentals of Logic"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Duration (Min)</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-8 pr-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      min="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Max Marks</label>
                  <div className="relative">
                    <Target className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-8 pr-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Pass Mark</label>
                  <input
                    type="number"
                    value={passMark}
                    onChange={(e) => setPassMark(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold"
                >
                  {loading ? 'Processing...' : 'Create & Publish'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
