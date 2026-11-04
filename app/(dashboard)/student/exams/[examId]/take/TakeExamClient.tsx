'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: string;
  options: any;
  points: number;
}

interface Exam {
  id: number;
  title: string;
  code: string;
  durationMinutes: number;
  totalMarks: number;
  course: { code: string; name: string };
  questions: Question[];
}

interface TakeExamClientProps {
  exam: Exam;
}

export const TakeExamClient: React.FC<TakeExamClientProps> = ({ exam }) => {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitting, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Countdown Timer
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // Tab-switch Proctoring Detection
  useEffect(() => {
    if (submitted) return;

    const handleBlur = () => {
      setTabSwitches((prev) => prev + 1);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [submitted]);

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitExam = async () => {
    if (submitted) return;
    setLoading(true);

    try {
      const res = await fetch('/api/student/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          tabSwitches,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting exam answers');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Exam Header & Anti-Cheating Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <span className="font-mono text-xs font-bold text-sky-400">{exam.code}</span>
          <h1 className="text-2xl font-black text-white">{exam.title}</h1>
          <p className="text-xs text-slate-400">{exam.course.code} — {exam.course.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Remaining</span>
            <div className={`text-2xl font-black font-mono ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-sky-400'}`}>
              <Clock className="w-5 h-5 inline mr-1" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Warning Badge */}
      {tabSwitches > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-400 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Proctoring Alert: Tab switches detected ({tabSwitches} times). Stay on the examination window.</span>
          </div>
          <Badge variant="warning">Logged</Badge>
        </div>
      )}

      {submitted ? (
        <Card className="p-8 text-center space-y-4 bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white">Exam Submitted Successfully!</h2>
          <p className="text-sm text-slate-300">
            Your responses have been recorded and saved. You can check your score in the Student Results portal.
          </p>
          <Button onClick={() => router.push('/student/results')} className="mt-2">
            View My Results
          </Button>
        </Card>
      ) : (
        /* Questions List */
        <div className="space-y-6">
          {exam.questions.map((q, idx) => (
            <Card key={q.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sky-400 text-sm">Question {idx + 1} of {exam.questions.length}</span>
                <Badge variant="secondary">{q.points} Points</Badge>
              </div>

              <h3 className="text-base font-bold text-white">{q.text}</h3>

              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {Object.entries(q.options).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectOption(q.id, key)}
                      className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                        answers[q.id] === key
                          ? 'bg-sky-500/15 border-sky-400 text-sky-300 shadow'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span><strong className="text-sky-400 mr-2">{key}.</strong> {String(val)}</span>
                      {answers[q.id] === key && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'ESSAY' && (
                <textarea
                  rows={4}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                  placeholder="Type your answer response..."
                />
              )}
            </Card>
          ))}

          {/* Submit Button Bar */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="px-8 py-3 text-base gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {submitting ? 'Submitting Responses...' : 'Submit Examination'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
