import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return null;

  // Fetch assignments for courses the student is enrolled in
  const assignments = await prisma.assignment.findMany({
    where: {
      course: { enrollments: { some: { studentId } } }
    },
    include: {
      course: true,
      submissions: {
        where: { studentId }
      }
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Course Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">Submit coursework, check deadlines, and view grades</p>
        </div>
        <Badge variant="info" className="px-3 py-1">
          {assignments.length} Total Assignments
        </Badge>
      </div>

      <Card className="p-6">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Course</th>
                <th>Total Marks</th>
                <th>Due Date</th>
                <th>Status / Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const submission = a.submissions[0];
                const isOverdue = new Date(a.dueDate) < new Date() && !submission;

                return (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${submission ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white">{a.title}</span>
                      </div>
                    </td>
                    <td className="text-slate-300 font-semibold">{a.course.code}</td>
                    <td className="font-bold text-amber-400">{a.totalMarks} pts</td>
                    <td className={`text-sm ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                      {new Date(a.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      {submission ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="success">Submitted</Badge>
                          {submission.grade !== null && (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Score: {submission.grade}</span>
                          )}
                        </div>
                      ) : isOverdue ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td>
                      <Link href={`/student/assignments/${a.id}/submit`}>
                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto">
                          {submission ? 'Update' : 'Submit'} <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                    <FileText className="w-10 h-10 mx-auto opacity-10 mb-4" />
                    No course assignments currently due.
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
