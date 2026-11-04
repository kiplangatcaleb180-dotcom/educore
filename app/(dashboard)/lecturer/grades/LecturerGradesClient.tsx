'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Award,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface Submission {
  id: number;
  type: 'EXAM' | 'ASSIGNMENT';
  title: string;
  courseCode: string;
  studentName: string;
  studentId: string | null;
  score: number | null;
  maxMarks: number;
  grade: string | null;
  status: string;
  feedback: string | null;
}

export default function LecturerGradesClient({
  initialSubmissions
}: {
  initialSubmissions: Submission[]
}) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXAMS' | 'ASSIGNMENTS'>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const router = useRouter();

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (selectedSubmission && selectedSubmission.type === 'EXAM') {
      fetchDetails(selectedSubmission.id);
    } else {
      setSubmissionDetails(null);
    }
  }, [selectedSubmission]);

  const fetchDetails = async (id: number) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/lecturer/submissions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionDetails(data.data);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || score === '') return;

    setLoading(true);
    try {
      const payload = selectedSubmission.type === 'EXAM'
        ? { submissionId: selectedSubmission.id, score: Number(score), feedback }
        : { assignmentSubmissionId: selectedSubmission.id, score: Number(score), feedback };

      const res = await fetch('/api/lecturer/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedSubmission(null);
        setScore('');
        setFeedback('');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Grading failed');
      }
    } catch (err) {
      alert('Error updating grade');
    } finally {
      setLoading(false);
    }
  };

  const filtered = initialSubmissions.filter(s => {
    const matchesTab = activeTab === 'ALL' || (activeTab === 'EXAMS' && s.type === 'EXAM') || (activeTab === 'ASSIGNMENTS' && s.type === 'ASSIGNMENT');
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Grades & Scoring</h1>
          <p className="text-sm text-slate-400 mt-1">Review and manage student academic performance scores</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'ALL' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
          All Submissions
        </button>
        <button
          onClick={() => setActiveTab('EXAMS')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'EXAMS' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Exams & CATs
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'ASSIGNMENTS' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Assignments
        </button>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment / Unit</th>
                <th>Type</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={`${s.type}-${s.id}`}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{s.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{s.studentId || 'No ID'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-300 font-semibold">{s.title}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{s.courseCode}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={s.type === 'EXAM' ? 'info' : 'secondary'} className="text-[10px]">{s.type}</Badge>
                  </td>
                  <td className="font-mono text-indigo-400 font-bold text-sm">
                    {s.score !== null ? `${s.score} / ${s.maxMarks}` : '--'}
                  </td>
                  <td>
                    <Badge variant={s.score !== null ? 'success' : 'warning'}>
                      {s.score !== null ? 'Graded' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(s);
                        setScore(String(s.score || ''));
                        setFeedback(s.feedback || '');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto"
                    >
                      {s.score !== null ? 'Update' : 'Grade Now'} <ExternalLink className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-500 italic text-sm">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-6 space-y-6 relative border-indigo-500/30 overflow-hidden flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Grade {selectedSubmission.type.toLowerCase()}</h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  {selectedSubmission.studentName}
                </p>
              </div>
            </div>

            <form onSubmit={handleGrade} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Assessment Details</p>
                 <h4 className="text-sm font-bold text-slate-200">{selectedSubmission.title}</h4>
                 <p className="text-xs text-slate-400 mt-1">Max Marks: <span className="text-white font-bold">{selectedSubmission.maxMarks}</span></p>
              </div>

              {selectedSubmission.type === 'EXAM' && (
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase sticky top-0 bg-slate-950/80 backdrop-blur py-2">Student Responses</p>

                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : submissionDetails ? (
                    submissionDetails.exam.questions.map((q: any, idx: number) => {
                      const studentAnswer = submissionDetails.answers[q.id];
                      const isAutoMarked = q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE';
                      const isCorrect = isAutoMarked && q.correctAnswer && studentAnswer?.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();

                      return (
                        <div key={q.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-400">Q{idx + 1}.</span>
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 border-slate-600">
                              {q.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-slate-200 font-medium">{q.text}</p>

                          <div className="mt-2 space-y-1">
                            <p className="text-slate-500 font-bold uppercase text-[9px]">Student Answer:</p>
                            <div className={`p-2 rounded bg-slate-900 border ${isAutoMarked ? (isCorrect ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400') : 'border-slate-700 text-slate-300'}`}>
                              {studentAnswer || <span className="italic opacity-50">No answer provided</span>}
                            </div>
                          </div>

                          {isAutoMarked && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                              {isCorrect ? (
                                <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500 font-bold">Auto-marked: Correct (+{q.points})</span></>
                              ) : (
                                <><AlertCircle className="w-3 h-3 text-rose-500" /> <span className="text-rose-500 font-bold">Auto-marked: Incorrect (0/{q.points})</span></>
                              )}
                            </div>
                          )}

                          {!isAutoMarked && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-400 font-bold">
                              <FileText className="w-3 h-3" /> Requires Manual Review (Max: {q.points})
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center py-4 text-slate-500 italic text-xs">Could not load responses.</p>
                  )}
                </div>
              )}

              {selectedSubmission.type === 'EXAM' && submissionDetails && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Auto-Graded Progress</p>
                  <p className="text-lg font-bold text-white">{submissionDetails.score} <span className="text-xs text-slate-500 font-normal">marks already awarded by system</span></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Score Awarded</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  max={selectedSubmission.maxMarks}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={`0 - ${selectedSubmission.maxMarks}`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lecturer Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                  placeholder="Well done, good progress..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || score === ''}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Saving...' : 'Finalize Grade'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
