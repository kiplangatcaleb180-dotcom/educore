import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { StudentPerformanceChart } from '@/components/student/StudentPerformanceChart';

export default async function StudentPerformancePage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const submissions = await prisma.submission.findMany({
    where: { studentId },
    include: { exam: { include: { course: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const performanceData = submissions.map(s => ({
    name: s.exam.code,
    score: Math.round(s.percentage || 0),
  })).reverse();

  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight text-indigo-400">Academic Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Detailed analysis of your exam results and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Average Score</p>
            <h3 className="text-2xl font-black text-white">{avgScore}%</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Exams</p>
            <h3 className="text-2xl font-black text-white">{submissions.length}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Pass Rate</p>
            <h3 className="text-2xl font-black text-white">
              {submissions.length > 0 ? Math.round((submissions.filter(s => (s.percentage || 0) >= 50).length / submissions.length) * 100) : 0}%
            </h3>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance History
        </h2>
        <StudentPerformanceChart data={performanceData.length > 0 ? performanceData : [{ name: 'N/A', score: 0 }]} />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Submissions</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Course</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="font-bold text-white">{s.exam.title}</td>
                  <td className="text-slate-400 text-sm">{s.exam.course.name}</td>
                  <td className="font-mono text-emerald-400 font-bold">{Math.round(s.percentage || 0)}%</td>
                  <td><Badge variant={(s.percentage || 0) >= 50 ? 'success' : 'danger'}>{s.grade || 'N/A'}</Badge></td>
                  <td><Badge variant="secondary">{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
