// Module Title: Admin Courses Management System
// User interface for administrators to manage academic courses.

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons
import {
  BookOpen,
  Plus,
  Users,
  UserPlus,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface Department {
  id: number;
  name: string;
  code: string;
}

interface UserOption {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  studentId?: string | null;
  staffId?: string | null;
}

interface CourseRecord {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  department: Department | null;
  lecturer: UserOption | null;
  enrollmentsCount: number;
  examsCount: number;
}

interface AdminCoursesClientProps {
  initialCourses: CourseRecord[];
  departments: Department[];
  lecturers: UserOption[];
  students: UserOption[];
}

export const AdminCoursesClient: React.FC<AdminCoursesClientProps> = ({
  initialCourses,
  departments,
  lecturers,
  students,
}) => {
  const router = useRouter();
  // State for local course list
  const [courses, setCourses] = React.useState<CourseRecord[]>(initialCourses);

  // Sync state with props when router.refresh() fetches new data
  React.useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseRecord | null>(null);

  // Form input states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [studentIdToEnroll, setStudentIdToEnroll] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handles course creation
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          credits: Number(credits),
          departmentId: departmentId ? Number(departmentId) : null,
          lecturerId: lecturerId ? Number(lecturerId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to create course.');
        setLoading(false);
      } else {
        setShowCreateModal(false);
        setCode('');
        setName('');
        setCredits('3');
        setDepartmentId('');
        setLecturerId('');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred creating the course.');
      setLoading(false);
    }
  };

  // Handles lecturer assignment
  const handleAssignLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_LECTURER',
          courseId: selectedCourse.id,
          lecturerId: lecturerId ? Number(lecturerId) : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAssignModal(false);
        router.refresh();
      } else {
        alert(data.message || 'Failed to assign lecturer');
      }
    } catch (err) {
      alert('Error assigning lecturer');
    } finally {
      setLoading(false);
    }
  };

  // Handles student enrollment
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !studentIdToEnroll) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ENROLL_STUDENT',
          courseId: selectedCourse.id,
          studentId: Number(studentIdToEnroll),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowEnrollModal(false);
        router.refresh();
      } else {
        alert(data.message || 'Failed to enroll student');
      }
    } catch (err) {
      alert('Error enrolling student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section with title and creation button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Courses & Curriculum</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create courses, assign lecturers, and enroll students into academic subjects.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Course
        </Button>
      </div>

      {/* Main course listing table */}
      <Card className="p-6">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Code</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Course Name</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Department</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Assigned Lecturer</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Credits</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Enrolled Students</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="text-sm">
                  <td className="py-4 font-mono text-xs text-sky-400 font-bold">{c.code}</td>
                  <td className="py-4 font-bold text-white">{c.name}</td>
                  <td className="py-4 text-slate-300">{c.department?.name || 'General'}</td>
                  <td className="py-4 text-slate-300 font-semibold">
                    {c.lecturer ? `${c.lecturer.firstName} ${c.lecturer.surname}` : '⚠️ Unassigned'}
                  </td>
                  <td className="py-4"><Badge variant="secondary">{c.credits} Credits</Badge></td>
                  <td className="py-4 font-bold text-emerald-400">{c.enrollmentsCount} Students</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCourse(c);
                          setLecturerId(c.lecturer?.id || '');
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1 text-xs gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Assign Lecturer
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedCourse(c);
                          setShowEnrollModal(true);
                        }}
                        className="px-2.5 py-1 text-xs gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Enroll Student
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 italic">
                    No courses found. Create your first course to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Course</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-xs text-red-400 border border-red-500/30">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <Input label="Course Code *" placeholder="CS201" value={code} onChange={(e) => setCode(e.target.value)} required />
              <Input label="Course Title *" placeholder="Data Structures & Algorithms" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Credits" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} required />

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Assign Lecturer</label>
                <select
                  value={lecturerId}
                  onChange={(e) => setLecturerId(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                >
                  <option value="">Select Lecturer...</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>{l.firstName} {l.surname} ({l.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Assign Lecturer Modal */}
      {showAssignModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Assign Lecturer to {selectedCourse.code}</h3>

            <form onSubmit={handleAssignLecturer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Lecturer</label>
                <select
                  value={lecturerId}
                  onChange={(e) => setLecturerId(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                >
                  <option value="">Unassign Lecturer</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>{l.firstName} {l.surname} ({l.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Save Assignment'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Enroll Student into {selectedCourse.code}</h3>

            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Select Student</label>
                <select
                  value={studentIdToEnroll}
                  onChange={(e) => setStudentIdToEnroll(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                  required
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.surname} ({s.studentId || s.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowEnrollModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Enrolling...' : 'Enroll Student'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
