'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Send, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Lecturer {
  id: number;
  firstName: string;
  surname: string;
  department: { name: string } | null;
}

interface Consultation {
  id: number;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: Date;
  lecturer: { firstName: string; surname: string };
}

export default function ConsultationClient({
  lecturers,
  initialConsultations
}: {
  lecturers: Lecturer[],
  initialConsultations: Consultation[]
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerId || !subject || !message) return;
    setLoading(true);

    try {
      const res = await fetch('/api/student/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerId: Number(lecturerId), subject, message }),
      });

      if (res.ok) {
        setSubject('');
        setMessage('');
        setLecturerId('');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit request');
      }
    } catch (err) {
      alert('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="success">Accepted</Badge>;
      case 'DECLINED': return <Badge variant="danger">Declined</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" /> New Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Select Lecturer</label>
              <select
                value={lecturerId}
                onChange={(e) => setLecturerId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Choose Lecturer...</option>
                {lecturers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.surname} ({l.department?.name || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Project Guidance"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your inquiry..."
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Submitting...' : 'Send Request'}
            </Button>
          </form>
        </Card>

        {/* Request History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Consultation History
          </h2>
          {initialConsultations.length > 0 ? initialConsultations.map((c) => (
            <Card key={c.id} className="p-5 border-l-4 border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white">{c.subject}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    To: {c.lecturer.firstName} {c.lecturer.surname} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(c.status)}
              </div>
              <p className="text-sm text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                {c.message}
              </p>
              {c.response && (
                <div className="mt-4 pl-4 border-l-2 border-emerald-500/50">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Lecturer Response
                  </p>
                  <p className="text-sm text-slate-200">{c.response}</p>
                </div>
              )}
            </Card>
          )) : (
            <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
              <MessageSquare className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p>No consultation requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
