'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileCheck2, Plus, HelpCircle, CheckCircle2, ArrowLeft, Trash2, Edit2, X } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: string;
  options: any;
  correctAnswer: string | null;
  points: number;
}

interface Exam {
  id: number;
  title: string;
  code: string;
  course: { code: string; name: string };
  questions: Question[];
}

interface QuestionsClientProps {
  exam: Exam;
}

export const QuestionsClient: React.FC<QuestionsClientProps> = ({ exam }) => {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>(exam.questions);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [text, setText] = useState('');
  const [type, setType] = useState('MULTIPLE_CHOICE');
  const [points, setPoints] = useState('2');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setText('');
    setType('MULTIPLE_CHOICE');
    setPoints('2');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer('A');
    setEditingQuestion(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setText(q.text);
    setType(q.type);
    setPoints(String(q.points));
    if (q.type === 'MULTIPLE_CHOICE' && q.options) {
      setOptA(q.options.A || '');
      setOptB(q.options.B || '');
      setOptC(q.options.C || '');
      setOptD(q.options.D || '');
    }
    setCorrectAnswer(q.correctAnswer || 'A');
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    const optionsJson = type === 'MULTIPLE_CHOICE' ? { A: optA, B: optB, C: optC, D: optD } : null;

    try {
      const method = editingQuestion ? 'PATCH' : 'POST';
      const body = {
        id: editingQuestion?.id,
        examId: exam.id,
        text,
        type,
        options: optionsJson,
        correctAnswer,
        points: Number(points),
      };

      const res = await fetch('/api/lecturer/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editingQuestion) {
          setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.question : q));
        } else {
          setQuestions((prev) => [...prev, data.question]);
        }
        setShowModal(false);
        resetForm();
        router.refresh();
      } else {
        alert(data.message || 'Failed to save question');
      }
    } catch (err) {
      alert('Error saving question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/lecturer/questions?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        router.refresh();
      } else {
        alert(data.message || 'Failed to delete question');
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/lecturer/exams')}
            className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Exams
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Question Builder — {exam.title}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {exam.course.code} — {exam.course.name} ({questions.length} Questions Added)
          </p>
        </div>

        <Button onClick={handleOpenAddModal} className="gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-6 space-y-3 relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  Q{idx + 1}
                </span>
                <Badge variant="info">{q.type}</Badge>
                <Badge variant="secondary">{q.points} Points</Badge>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal(q)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-base font-bold text-white">{q.text}</h3>

            {q.type === 'MULTIPLE_CHOICE' && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {Object.entries(q.options).map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      q.correctAnswer === key
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{key}: {String(val)}</span>
                    {q.correctAnswer === key && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}

            {q.type === 'TRUE_FALSE' && (
              <div className="pt-2">
                <Badge variant={q.correctAnswer === 'TRUE' ? 'success' : 'danger'} className="text-[10px]">
                  Correct Answer: {q.correctAnswer}
                </Badge>
              </div>
            )}
          </Card>
        ))}

        {questions.length === 0 && (
          <Card className="p-8 text-center text-slate-400">
            No questions added to this exam yet. Click "Add Question" to start building.
          </Card>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? 'Edit Question' : 'Add Question to Exam'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Question Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="ESSAY">Essay / Written</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Question Prompt *</label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                  placeholder="Enter the question statement..."
                  required
                />
              </div>

              {type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  <Input label="Option A *" value={optA} onChange={(e) => setOptA(e.target.value)} required />
                  <Input label="Option B *" value={optB} onChange={(e) => setOptB(e.target.value)} required />
                  <Input label="Option C *" value={optC} onChange={(e) => setOptC(e.target.value)} required />
                  <Input label="Option D *" value={optD} onChange={(e) => setOptD(e.target.value)} required />

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Correct Option Key</label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              )}

              {type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Correct Answer</label>
                  <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                  >
                    <option value="TRUE">True</option>
                    <option value="FALSE">False</option>
                  </select>
                </div>
              )}

              <Input label="Points Value" type="number" value={points} onChange={(e) => setPoints(e.target.value)} required />

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
