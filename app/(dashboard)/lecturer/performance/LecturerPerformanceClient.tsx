'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  Search,
  User,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { LecturerPerformanceChart } from '@/components/lecturer/LecturerPerformanceChart';
import Link from 'next/link';

interface CourseData {
  course: string;
  avgScore: number;
  passRate: number;
}

interface EnrolledStudent {
  id: number;
  firstName: string;
  surname: string;
  studentId: string | null;
  coursesCount: number;
}

export default function LecturerPerformanceClient({
  chartData,
  students,
  stats
}: {
  chartData: CourseData[],
  students: EnrolledStudent[],
  stats: { totalStudents: number; avgScore: number }
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Cross-course performance comparison and student engagement metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <Card className="px-4 py-2 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Class Average</span>
              <span className="text-xl font-black text-emerald-400">{stats.avgScore}%</span>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Course Average Scores
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Comparative analytics of exam performance per course</p>
            </div>
            <Badge variant="info">Current Term</Badge>
          </div>
          <LecturerPerformanceChart data={chartData} />
        </Card>

        {/* Student Drill Down Sidebar */}
        <Card className="lg:col-span-1 p-6 flex flex-col border-slate-800">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <User className="w-5 h-5 text-sky-400" /> Student Drill-down
           </h2>
           <div className="relative mb-6">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by name or ID..."
               className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
             />
           </div>

           <div className="flex-1 space-y-3">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Results ({filteredStudents.length})</p>
             {filteredStudents.map((s) => (
               <div key={s.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0">
                       <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-bold text-white text-xs truncate">{s.firstName} {s.surname}</h4>
                       <p className="text-[9px] font-mono text-slate-500 uppercase">{s.studentId || 'No ID'}</p>
                    </div>
                  </div>
                  <Link href={`/lecturer/students`}>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
               </div>
             ))}
             {filteredStudents.length === 0 && (
               <p className="text-center py-10 text-slate-600 text-xs italic">No matching students found.</p>
             )}
           </div>

           <div className="mt-8 pt-6 border-t border-slate-800">
              <Link href="/lecturer/students">
                <Button variant="outline" className="w-full text-xs font-bold gap-2">
                   View Full Roster <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-6">Subject Pass Rates</h2>
            <div className="space-y-6">
               {chartData.map((data, idx) => (
                 <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-300 uppercase tracking-tighter">{data.course}</span>
                       <span className="text-emerald-400 font-bold">{data.passRate}% Success</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${data.passRate}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-white">Academic Summary</h2>
               <Badge variant="secondary">2025/2026</Badge>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-white">{chartData.length}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Units</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-white">{stats.totalStudents}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Students</p>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
