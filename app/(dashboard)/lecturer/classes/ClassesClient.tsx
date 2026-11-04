'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Video, BookOpen, Users, Plus, AlertCircle, Play, Edit, Calendar, Clock, MapPin, BarChart3, Loader2 } from 'lucide-react';

interface Course {
  id: number;
  code: string;
  name: string;
  department: { name: string } | null;
  credits: number;
  enrollmentsCount: number;
  scheduleDay: string | null;
  scheduleTime: string | null;
  room: string | null;
  syllabusProgress: number;
}

interface ClassesClientProps {
  courses: Course[];
  activeLiveClasses: any[];
}

export const ClassesClient: React.FC<ClassesClientProps> = ({ courses, activeLiveClasses }) => {
  const router = useRouter();
  const [showLaunchModal, setShowShowLaunchModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>(courses[0]?.id || '');
  const [classTitle, setClassTitle] = useState('');

  // Course update form state
  const [updatingCourse, setUpdatingCourse] = useState<Course | null>(null);
  const [editDay, setEditDay] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editProgress, setEditProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCourseId) {
      setError('Please select an assigned subject/course.');
      return;
    }

    if (!classTitle.trim()) {
      setError('Please enter a title for the live class session.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: classTitle,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to launch live class.');
        setLoading(false);
      } else {
        router.push(`/lecturer/live-room/${data.liveClass.id}`);
      }
    } catch (err: any) {
      setError('An error occurred while launching the live class.');
      setLoading(false);
    }
  };

  const openUpdateModal = (course: Course) => {
    setUpdatingCourse(course);
    setEditDay(course.scheduleDay || '');
    setEditTime(course.scheduleTime || '');
    setEditRoom(course.room || '');
    setEditProgress(course.syllabusProgress || 0);
    setShowUpdateModal(true);
    setError('');
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingCourse) return;

    setUpdateLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/lecturer/courses/${updatingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleDay: editDay,
          scheduleTime: editTime,
          room: editRoom,
          syllabusProgress: editProgress,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to update course.');
      } else {
        setShowUpdateModal(false);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during update.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Classes & Live Classroom</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage course lectures, view student rosters, and launch WebRTC live broadcasts.
          </p>
        </div>
        <Button
          onClick={() => setShowShowLaunchModal(true)}
          className="gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 shadow-lg shadow-sky-500/20"
        >
          <Video className="w-5 h-5" /> Launch Live Class
        </Button>
      </div>

      {/* Active Live Broadcast Banner if running */}
      {activeLiveClasses.length > 0 && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-500/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="font-extrabold text-white text-lg">Active Live Broadcast in Progress</h3>
                <p className="text-xs text-slate-300">
                  {activeLiveClasses[0].title} ({activeLiveClasses[0].course.code})
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/lecturer/live-room/${activeLiveClasses[0].id}`)}
              className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              <Play className="w-4 h-4" /> Enter Control Room
            </Button>
          </div>
        </Card>
      )}

      {/* Assigned Subjects Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> My Assigned Subjects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Card key={c.id} className="p-6 space-y-4 hover:border-indigo-500/40">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-400">{c.code}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{c.name}</h3>
                  <p className="text-xs text-slate-400">{c.department?.name || 'Department'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">{c.credits} Credits</Badge>
                  <button
                    onClick={() => openUpdateModal(c)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/30 transition-all"
                    title="Update Schedule & Progress"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.scheduleDay || 'TBD'} • {c.scheduleTime || 'Time TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.room || 'No Room Assigned'}</span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Syllabus Progress</span>
                    <span className="text-sky-400">{c.syllabusProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${c.syllabusProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" /> {c.enrollmentsCount} Enrolled
                </span>
                <button
                  onClick={() => {
                    setSelectedCourseId(c.id);
                    setClassTitle(`Live Session — ${c.code}`);
                    setShowShowLaunchModal(true);
                  }}
                  className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Start Broadcast
                </button>
              </div>
            </Card>
          ))}
          {courses.length === 0 && (
            <Card className="p-8 text-center col-span-3 text-slate-400">
              No subjects currently assigned to you. Contact the system administrator.
            </Card>
          )}
        </div>
      </div>

      {/* Launch Live Class Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Start New Live Class</h3>
                  <p className="text-xs text-slate-400">Select an assigned subject to broadcast to enrolled students</p>
                </div>
              </div>
              <button
                onClick={() => setShowShowLaunchModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartLiveClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Select Subject / Course *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full h-11 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                  required
                >
                  <option value="" disabled>Select assigned subject...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.enrollmentsCount} Students)
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Class Session Title *"
                placeholder="e.g. Chapter 4: Data Structures & Trees"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                required
              />

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowShowLaunchModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? 'Launching Room...' : 'Broadcast Live Now'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Update Course Schedule & Progress Modal */}
      {showUpdateModal && updatingCourse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Update Course Details</h3>
                  <p className="text-xs text-slate-400">{updatingCourse.code}: {updatingCourse.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Schedule Day
                  </label>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <Input
                  label="Schedule Time"
                  placeholder="e.g. 10:00 AM - 12:00 PM"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
              </div>

              <Input
                label="Room / Location"
                placeholder="e.g. Lab 3B or Virtual Room 1"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Syllabus Progress (%)
                  </label>
                  <span className="text-indigo-400 font-bold text-sm">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateLoading} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
                  {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
