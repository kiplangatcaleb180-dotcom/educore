import React from 'react';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock } from 'lucide-react';

export default async function StudentTimetablePage() {
  const courses = await prisma.course.findMany({
    include: { lecturer: true, department: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Class Timetable</h1>
          <p className="text-xs text-slate-400 mt-1">Weekly schedule of enrolled courses and lecture sessions</p>
        </div>
        <Badge variant="info" className="px-3 py-1">
          {courses.length} Enrolled Courses
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.id} className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-400">{c.code}</span>
              <Badge variant="secondary">Semester {c.semester}</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">{c.name}</h3>
            <p className="text-xs text-slate-400">
              Instructor: {c.lecturer ? `${c.lecturer.firstName} ${c.lecturer.surname}` : 'TBA'}
            </p>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-400" /> Mon/Wed 10:00 AM</span>
              <span className="font-bold text-emerald-400">{c.credits} Credits</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
