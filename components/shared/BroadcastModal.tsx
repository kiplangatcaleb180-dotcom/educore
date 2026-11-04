'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Megaphone, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  courses?: { id: number; code: string; name: string }[];
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  userRole,
  courses = []
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [targetRole, setTargetRole] = useState<string | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          courseId: courseId === '' ? null : Number(courseId),
          targetRole: targetRole === '' ? null : targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send broadcast.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCourseId('');
    setTargetRole('');
    setSuccess(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 space-y-6 relative border-indigo-500/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Send Broadcast Message</h2>
            <p className="text-xs text-slate-400 mt-1">This will send a direct notification to all target students.</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Broadcast Sent!</h3>
            <p className="text-sm text-slate-400">Recipients will receive your message instantly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Subject / Title"
              placeholder="Important Update Regarding..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-left">Message Content</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Write your announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-left">Target Course (Optional)</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All My Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                </div>
              )}

              {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-left">Target Role (Optional)</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Everyone</option>
                    <option value="STUDENT">All Students</option>
                    <option value="LECTURER">All Lecturers</option>
                    <option value="ADMIN">Administrators</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Now'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
