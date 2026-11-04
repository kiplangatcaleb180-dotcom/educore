import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  TrendingUp,
  FolderDown,
  Award,
  ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';

// Today's Schedule Widget
export const TodaySchedule = ({ items }: { items: any[] }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" /> Today's Schedule
      </h2>
      <Link href="/student/timetable" className="text-xs font-bold text-indigo-400 hover:underline">
        View Timetable
      </Link>
    </div>
    <div className="space-y-3">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{item.type}</span>
            <h4 className="font-bold text-white text-sm">{item.title}</h4>
            <p className="text-xs text-slate-400">{item.time} • {item.location}</p>
          </div>
          <Badge variant={item.status === 'Ongoing' ? 'success' : 'info'}>{item.status}</Badge>
        </div>
      )) : (
        <p className="text-slate-500 text-sm py-4 text-center italic">No classes or exams today</p>
      )}
    </div>
  </Card>
);

// Recent Materials Widget
export const RecentMaterials = ({ items }: { items: any[] }) => (
  <Card className="p-6">
    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <FolderDown className="w-5 h-5 text-sky-400" /> Recent Materials
    </h2>
    <div className="space-y-3">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={idx} className="group flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-sky-500/30 transition-all">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{item.courseCode}</p>
          </div>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 group-hover:text-sky-400 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )) : (
        <p className="text-slate-500 text-sm py-4 text-center">No recent materials</p>
      )}
    </div>
  </Card>
);

// Upcoming Assignments Widget
export const UpcomingAssignments = ({ items }: { items: any[] }) => (
  <Card className="p-6">
    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <FileText className="w-5 h-5 text-amber-400" /> Upcoming Assignments
    </h2>
    <div className="space-y-3">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-white text-sm">{item.title}</h4>
            <Badge variant={item.daysLeft <= 2 ? 'danger' : 'warning'} className="text-[10px]">
              {item.daysLeft} days left
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mb-2">{item.courseName}</p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
             <div className="bg-amber-500 h-full" style={{ width: `${Math.max(0, 100 - (item.daysLeft * 10))}%` }} />
          </div>
        </div>
      )) : (
        <p className="text-slate-500 text-sm py-4 text-center">All caught up!</p>
      )}
    </div>
  </Card>
);

// Weekly Progress Widget
export const WeeklyProgress = ({ percentage }: { percentage: number }) => (
  <Card className="p-6 flex flex-col items-center justify-center text-center">
    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Weekly Progress</h2>
    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
      <svg className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * percentage) / 100}
          strokeLinecap="round" className="text-emerald-500 transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{percentage}%</span>
        <span className="text-[10px] text-slate-500 font-bold">DONE</span>
      </div>
    </div>
    <p className="text-xs text-slate-400 font-medium">You've completed {percentage}% of this week's tasks</p>
  </Card>
);

// Attendance Overview Widget
export const AttendanceOverview = ({ present, absent, late }: { present: number, absent: number, late: number }) => {
  const total = present + absent + late;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" /> Attendance Overview
        </h2>
        <Link href="/student/roll-call" className="text-[10px] font-bold text-emerald-400 hover:underline uppercase tracking-tighter">
          View Log
        </Link>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
           <div>
             <p className="text-2xl font-black text-white">{rate}%</p>
             <p className="text-xs font-bold text-slate-500 uppercase">Average Attendance</p>
           </div>
           <Badge variant={rate > 75 ? 'success' : 'warning'}>{rate > 75 ? 'Good' : 'Needs Work'}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-sm font-black text-emerald-400">{present}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Present</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <p className="text-sm font-black text-red-400">{absent}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Absent</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm font-black text-amber-400">{late}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Late</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Course Performance Widget
export const CoursePerformance = ({ gpa, credits }: { gpa: number, credits: number }) => (
  <Card className="p-6 overflow-hidden relative">
    <div className="absolute top-0 right-0 p-8 opacity-5">
      <TrendingUp className="w-32 h-32" />
    </div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-white">Academic Performance</h2>
      <Link href="/student/performance" className="text-[10px] font-bold text-indigo-400 hover:underline uppercase tracking-tighter">
        Analytics
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Cumulative GPA</p>
        <div className="flex items-baseline gap-2">
           <h3 className="text-4xl font-black text-white">{gpa.toFixed(2)}</h3>
           <span className="text-xs font-bold text-emerald-400">/ 4.00</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Credits Earned</p>
        <h3 className="text-4xl font-black text-white">{credits}</h3>
      </div>
    </div>
  </Card>
);

// Achievements Widget
export const Achievements = ({ items }: { items: any[] }) => (
  <Card className="p-6">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-amber-400" /> Recent Achievements
    </h2>
    <div className="flex flex-wrap gap-4">
      {items.length > 0 ? items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2 w-24">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
              {item.icon || <Award className="w-8 h-8" />}
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-300 text-center leading-tight">{item.title}</span>
        </div>
      )) : (
        <p className="text-slate-500 text-sm italic w-full text-center">Unlock achievements by participating in classes and scoring high in exams!</p>
      )}
    </div>
  </Card>
);

