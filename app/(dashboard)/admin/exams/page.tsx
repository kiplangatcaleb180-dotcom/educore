import React from 'react';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileCheck2, Clock, CheckCircle2 } from 'lucide-react';

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: {
      course: true,
      creator: true,
      _count: {
        select: { questions: true, submissions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CATs & Examinations</h1>
          <p className="text-xs text-slate-400 mt-1">System-wide monitoring of assessment tests and quizzes</p>
        </div>
        <Badge variant="info" className="px-3 py-1">
          {exams.length} Total Exams
        </Badge>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Exam Code</th>
                <th>Title</th>
                <th>Course</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Total Marks</th>
                <th>Questions</th>
                <th>Submissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td className="font-mono text-xs text-sky-400 font-bold">{e.code}</td>
                  <td className="font-bold text-white">{e.title}</td>
                  <td className="text-slate-300">{e.course.name} ({e.course.code})</td>
                  <td><Badge variant="info">{e.type}</Badge></td>
                  <td className="text-slate-300">{e.durationMinutes} mins</td>
                  <td className="font-bold text-amber-400">{e.totalMarks} pts</td>
                  <td><Badge variant="secondary">{e._count.questions} Qs</Badge></td>
                  <td className="font-bold text-emerald-400">{e._count.submissions}</td>
                  <td>
                    <Badge variant={e.isOpen ? 'success' : 'secondary'}>
                      {e.isOpen ? 'Active' : e.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
