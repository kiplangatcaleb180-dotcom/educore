// Student Exam Results: History of graded examinations and performance tracking.
import React from 'react';
// Auth and database tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Icons
import { Award, TrendingUp, FileCheck2, CheckCircle2 } from 'lucide-react';

export default async function StudentResultsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  // Retrieve all graded submissions for the student
  const submissions = await prisma.submission.findMany({
    where: studentId ? { studentId } : {},
    include: {
      exam: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate overall performance metrics
  const totalPercentage = submissions.reduce((acc, s) => acc + (s.percentage || 0), 0);
  const avgScore = submissions.length > 0 ? Math.round(totalPercentage / submissions.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header section with page summary */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Examination Results</h1>
        <p className="text-sm text-slate-400 mt-1">
          View graded CATs, exam scores, percentage marks, and instructor feedback.
        </p>
      </div>

      {/* Grid of aggregated performance statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Exams</p>
            <h3 className="text-3xl font-black text-white mt-1">{submissions.length}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <FileCheck2 className="w-6 h-6 text-sky-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">{avgScore}%</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Academic Status</p>
            <h3 className="text-xl font-extrabold text-indigo-400 mt-1">Good Standing</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
        </Card>
      </div>

      {/* Graded results history table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-white mb-4">Graded Submissions History</h2>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Exam Code</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Exam Title</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Course</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Score</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Percentage</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Grade</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Feedback</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {submissions.map((s) => (
                <tr key={s.id} className="text-sm">
                  <td className="py-4 font-mono text-xs text-sky-400 font-bold">{s.exam.code}</td>
                  <td className="py-4 font-bold text-white">{s.exam.title}</td>
                  <td className="py-4 text-slate-300">{s.exam.course.name}</td>
                  <td className="py-4 font-bold text-amber-400">{s.score} / {s.exam.totalMarks}</td>
                  <td className="py-4 font-bold text-emerald-400">{s.percentage}%</td>
                  <td className="py-4"><Badge variant="success">{s.grade || 'A'}</Badge></td>
                  <td className="py-4 text-slate-300 italic">{s.feedback || 'Good attempt.'}</td>
                  <td className="py-4 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No graded examination submissions available yet.
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
