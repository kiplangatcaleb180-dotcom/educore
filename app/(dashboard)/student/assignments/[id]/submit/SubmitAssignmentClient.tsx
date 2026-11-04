'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  course: { code: string; name: string };
  dueDate: Date;
  totalMarks: number;
}

export default function SubmitAssignmentClient({ assignment }: { assignment: Assignment }) {
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submissionText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/student/assignments'), 2000);
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting assignment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white">Assignment Submitted!</h2>
        <p className="text-slate-400">Your work has been successfully uploaded for grading.</p>
        <p className="text-xs text-slate-500">Redirecting to assignments list...</p>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/student/assignments">
          <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-full bg-slate-800/50 hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Submit Assignment</h1>
          <p className="text-sm text-slate-400 mt-1">{assignment.course.code} — {assignment.course.name}</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">{assignment.title}</h2>
            <Badge variant="warning">Due {new Date(assignment.dueDate).toLocaleDateString()}</Badge>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 text-sm text-slate-300 border border-slate-800">
            {assignment.description || 'No instructions provided.'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Submission Content / Text</label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
              placeholder="Enter your answers or paste your work here..."
              required
            />
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">File Upload (Optional)</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-0.5">PDF, DOCX, or ZIP files supported</p>
            </div>
            <input type="file" className="hidden" id="file-upload" disabled />
            <Button type="button" variant="outline" size="sm" onClick={() => alert('File upload coming soon. Please use text submission.')}>
              Browse
            </Button>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Link href="/student/assignments">
               <Button type="button" variant="ghost">Cancel</Button>
             </Link>
             <Button type="submit" disabled={loading || !submissionText.trim()} className="bg-indigo-600 hover:bg-indigo-700 px-10">
               {loading ? 'Submitting...' : 'Upload Submission'}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
