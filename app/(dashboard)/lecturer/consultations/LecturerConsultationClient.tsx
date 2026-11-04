'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Consultation {
  id: number;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: Date;
  student: { firstName: string; surname: string; studentId: string | null };
}

export default function LecturerConsultationClient({
  initialConsultations
}: {
  initialConsultations: Consultation[]
}) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESPONDED'>('PENDING');
  const [response, setResponse] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (id: number, status: 'APPROVED' | 'DECLINED') => {
    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, response: status === 'APPROVED' ? response : 'Declined' }),
      });

      if (res.ok) {
        setResponse('');
        setSelectedId(null);
        router.refresh();
      } else {
        alert('Failed to update request');
      }
    } catch (err) {
      alert('Error updating request');
    } finally {
      setLoading(false);
    }
  };

  const filtered = initialConsultations.filter(c =>
    activeTab === 'PENDING' ? c.status === 'PENDING' : c.status !== 'PENDING'
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'PENDING' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Pending Requests ({initialConsultations.filter(c => c.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('RESPONDED')}
          className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'RESPONDED' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Responded ({initialConsultations.filter(c => c.status !== 'PENDING').length})
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((c) => (
          <Card key={c.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{c.student.firstName} {c.student.surname}</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{c.student.studentId || 'No ID'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 mb-4">
              <h4 className="font-bold text-indigo-400 text-sm mb-1">{c.subject}</h4>
              <p className="text-sm text-slate-300">{c.message}</p>
            </div>

            {c.status === 'PENDING' ? (
              <div className="space-y-4">
                {selectedId === c.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Write your response/guidance here..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(c.id, 'APPROVED')}
                        disabled={loading || !response.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Send Response & Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSelectedId(c.id)} className="bg-indigo-600 hover:bg-indigo-700">
                      Respond
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(c.id, 'DECLINED')} className="text-red-400 border-red-500/20 hover:bg-red-500/5">
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="pl-4 border-l-2 border-slate-700 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={c.status === 'APPROVED' ? 'success' : 'danger'}>
                    {c.status === 'APPROVED' ? 'Accepted' : 'Declined'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 italic">"{c.response}"</p>
              </div>
            )}
          </Card>
        )) : (
          <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
            <MessageSquare className="w-12 h-12 mx-auto opacity-20 mb-4" />
            <p>No {activeTab.toLowerCase()} consultation requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
