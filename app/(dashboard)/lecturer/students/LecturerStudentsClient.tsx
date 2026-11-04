'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Users,
  UserCheck,
  TrendingUp,
  ClipboardCheck,
  Search,
  Filter
} from 'lucide-react';

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  courseCode: string;
  courseName: string;
  isActive: boolean;
  isBlocked: boolean;
  yearOfStudy: string;
  avgPerformance: number;
  attendanceRate: number;
}

interface KPIs {
  totalStudents: number;
  activeStudents: number;
  avgPerformance: number;
  attendanceRate: number;
}

interface CourseItem {
  code: string;
  name: string;
}

interface LecturerStudentsClientProps {
  students: Student[];
  kpis: KPIs;
  courses: CourseItem[];
}

export const LecturerStudentsClient: React.FC<LecturerStudentsClientProps> = ({
  students,
  kpis,
  courses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter students based on selection
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      // Course filter
      const matchesCourse = selectedCourse === 'ALL' || s.courseCode === selectedCourse;

      // Year filter
      const matchesYear = selectedYear === 'ALL' || s.yearOfStudy === selectedYear;

      // Status filter
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && s.isActive) ||
        (selectedStatus === 'INACTIVE' && !s.isActive);

      return matchesSearch && matchesCourse && matchesYear && matchesStatus;
    });
  }, [students, searchTerm, selectedCourse, selectedYear, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Assigned Students</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor performance, attendance rates, and active enrollment across your assigned courses.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number of Students</p>
            <h3 className="text-3xl font-black text-white mt-1">{kpis.totalStudents}</h3>
            <span className="text-[11px] text-indigo-400 font-semibold mt-1 inline-block">Assigned Cohorts</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
            <h3 className="text-3xl font-black text-white mt-1">{kpis.activeStudents}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Active & Unblocked</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Performance</p>
            <h3 className="text-3xl font-black text-white mt-1">{kpis.avgPerformance}%</h3>
            <span className="text-[11px] text-sky-400 font-semibold mt-1 inline-block">Overall Exam Average</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <TrendingUp className="w-6 h-6 text-sky-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-3xl font-black text-white mt-1">{kpis.attendanceRate}%</h3>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">Lecture Check-ins</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <ClipboardCheck className="w-6 h-6 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
          <Filter className="w-4 h-4 text-indigo-400" /> Filter & Search Students
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Search Name or Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
            >
              <option value="ALL">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year of Study Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
            >
              <option value="ALL">All Years of Study</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Students List Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Assigned Student Roster</h2>
          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Enrolled Course</th>
                <th>Year</th>
                <th>Avg Score (%)</th>
                <th>Attendance (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs text-indigo-400 font-bold">{s.studentId}</td>
                  <td className="font-bold text-white">{s.name}</td>
                  <td className="text-slate-300">{s.email}</td>
                  <td className="text-slate-300">{s.courseCode} — {s.courseName}</td>
                  <td><Badge variant="secondary">{s.yearOfStudy}</Badge></td>
                  <td className="font-bold text-sky-400">{s.avgPerformance}%</td>
                  <td className="font-bold text-emerald-400">{s.attendanceRate}%</td>
                  <td>
                    <Badge variant={s.isActive ? 'success' : 'secondary'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
