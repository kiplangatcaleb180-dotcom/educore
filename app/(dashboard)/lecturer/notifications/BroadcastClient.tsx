'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Users, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  code: string;
  name: string;
}

export default function BroadcastClient({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !message) return;
    setLoading(true);

    try {
      const res = await fetch('/api/lecturer/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: Number(courseId), title, message }),
      });

      if (res.ok) {
        setTitle('');
        setMessage('');
        setCourseId('');
        alert('Broadcast sent successfully!');
        router.refresh();
      } else {
        alert('Failed to send broadcast');
      }
    } catch (err) {
      alert('Error sending broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-indigo-500/5 border-indigo-500/20">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-indigo-400" /> Course Broadcast
      </h2>
      <p className="text-xs text-slate-400 mb-6 italic">Send an automated alert to all students enrolled in a specific unit.</p>

      <form onSubmit={handleBroadcast} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">Target Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">Subject</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Missed CAT 1 Reminder"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">Broadcast Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Type your message to the class..."
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold px-8">
          <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Dispatch Broadcast'}
        </Button>
      </form>
    </Card>
  );
}
