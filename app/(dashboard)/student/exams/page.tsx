// Student Exams Management: Lists all available and completed examinations.
import React from 'react';
// Database and auth tools
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// Navigation and Icons
import { FileCheck2, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return null;

  // Retrieve exams for the student's enrolled courses including their submissions
  const exams = await prisma.exam.findMany({
    where: {
      course: { enrollments: { some: { studentId } } }
    },
    include: {
      course: true,
      questions: true,
      submissions: {
        where: { studentId }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header section with page summary and status badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My CATs & Examinations</h1>
          <p className="text-sm text-slate-400 mt-1">Take online timed examinations with tab-switch proctoring</p>
        </div>
        <Badge variant="info" className="px-3 py-1">
          {exams.filter(e => e.isOpen && e.submissions.length === 0).length} Available Exams
        </Badge>
      </div>

      {/* Grid for individual exam cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((e) => {
          const hasSubmitted = e.submissions.length > 0;
          const canTake = e.isOpen && !hasSubmitted;

          return (
            <Card key={e.id} className={`p-6 space-y-4 transition-all ${hasSubmitted ? 'opacity-70 grayscale' : 'hover:border-sky-500/40'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-400">{e.code}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{e.title}</h3>
                  <p className="text-xs text-slate-400">{e.course.name} ({e.course.code})</p>
                </div>
                <Badge variant={hasSubmitted ? 'success' : e.isOpen ? 'success' : 'secondary'}>
                  {hasSubmitted ? 'Completed' : e.isOpen ? 'Open Now' : e.status}
                </Badge>
              </div>

              {/* Exam metadata row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold"><Clock className="w-3.5 h-3.5 text-sky-400" /> {e.durationMinutes} Minutes</span>
                <span className="font-bold text-amber-400">{e.totalMarks} Points</span>
                <span className="font-bold uppercase tracking-tighter">{e.questions.length} Questions</span>
              </div>

              {/* Action button based on availability and submission status */}
              {canTake ? (
                <Link href={`/student/exams/${e.id}/take`} className="block w-full">
                  <Button className="w-full mt-2 bg-sky-600 hover:bg-sky-700 gap-2 font-bold">
                    Start Timed Examination <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" disabled className="w-full mt-2 font-bold">
                  {hasSubmitted ? 'Submission Recorded' : 'Exam Closed'}
                </Button>
              )}
            </Card>
          );
        })}
        {/* Empty state when no exams are found */}
        {exams.length === 0 && (
          <Card className="p-12 text-center col-span-2 text-slate-500 border-dashed border-2 border-slate-800 rounded-3xl">
            <FileCheck2 className="w-12 h-12 mx-auto opacity-10 mb-4" />
            <p className="text-sm">No examinations assigned to your enrolled units yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
