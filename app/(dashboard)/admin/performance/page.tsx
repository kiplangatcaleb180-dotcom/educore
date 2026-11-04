import React from 'react';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Target,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { LecturerPerformanceChart } from '@/components/lecturer/LecturerPerformanceChart';

export default async function AdminPerformancePage() {
  // Aggregated data for admin view
  const [totalStudents, totalLecturers, totalCourses, submissions] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'LECTURER' } }),
    prisma.course.count(),
    prisma.submission.findMany({
      include: { exam: { include: { course: { include: { department: true } } } } }
    })
  ]);

  // Calculate overall metrics
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length)
    : 0;

  const passRate = submissions.length > 0
    ? Math.round((submissions.filter(s => (s.percentage || 0) >= 50).length / submissions.length) * 100)
    : 0;

  // Group performance by department for chart
  const deptPerformance: Record<string, { total: number, count: number }> = {};
  submissions.forEach(s => {
    const deptName = s.exam.course.department?.name || 'General';
    if (!deptPerformance[deptName]) deptPerformance[deptName] = { total: 0, count: 0 };
    deptPerformance[deptName].total += (s.percentage || 0);
    deptPerformance[deptName].count += 1;
  });

  const chartData = Object.entries(deptPerformance).map(([name, data]) => ({
    course: name,
    avgScore: Math.round(data.total / data.count),
    passRate: 0 // We'll just show average score on the chart for department comparison
  }));

  // Find top performing course
  const courseStats: Record<string, { total: number, count: number, code: string }> = {};
  submissions.forEach(s => {
    const name = s.exam.course.name;
    if (!courseStats[name]) courseStats[name] = { total: 0, count: 0, code: s.exam.course.code };
    courseStats[name].total += (s.percentage || 0);
    courseStats[name].count += 1;
  });

  const topCourses = Object.entries(courseStats)
    .map(([name, data]) => ({ name, code: data.code, avg: Math.round(data.total / data.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Institutional Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Global academic metrics and department-wide success analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Avg. Score</p>
            <h3 className="text-2xl font-black text-white mt-1">{avgScore}%</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Pass Rate</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{passRate}%</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Roster</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalStudents}</h3>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total CATs/Exams</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{submissions.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Department Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Average academic performance by specialization area</p>
            </div>
          </div>
          <LecturerPerformanceChart data={chartData} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" /> Top Performing Units
          </h2>
          <div className="space-y-4">
             {topCourses.map((c, idx) => (
               <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80">
                  <div className="flex items-center gap-3">
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        {idx + 1}
                     </span>
                     <div>
                        <p className="font-bold text-white text-sm">{c.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{c.code}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-emerald-400">{c.avg}%</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase">Avg. Score</p>
                  </div>
               </div>
             ))}
             {topCourses.length === 0 && <p className="text-center py-10 text-slate-500 text-sm">No unit performance data available.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
