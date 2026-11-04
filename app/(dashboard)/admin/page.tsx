// MODULE: Admin Dashboard Overview - High-level statistical summary of the system.
import React from 'react';
// Imports database tool to fetch data
import prisma from '@/lib/prisma';
// Imports UI components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Imports icons for visual metrics
import { Users, GraduationCap, BookOpen, FileCheck2, Activity, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch system-wide statistics in parallel
  const [totalUsers, totalStudents, totalLecturers, totalCourses, totalExams] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'LECTURER' } }),
    prisma.course.count(),
    prisma.exam.count(),
  ]);

  // Define Key Performance Indicators (KPIs)
  const kpis = [
    { label: 'Total Users', value: totalUsers, icon: <Users className="w-6 h-6 text-sky-400" />, badge: '+12% this month' },
    { label: 'Enrolled Students', value: totalStudents, icon: <GraduationCap className="w-6 h-6 text-emerald-400" />, badge: 'Active' },
    { label: 'Lecturers', value: totalLecturers, icon: <Users className="w-6 h-6 text-indigo-400" />, badge: 'Faculty' },
    { label: 'Active Courses', value: totalCourses, icon: <BookOpen className="w-6 h-6 text-amber-400" />, badge: 'Semester 1' },
  ];

  // Fetch the 5 most recent user registrations
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      surname: true,
      email: true,
      role: true,
      pendingApproval: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time statistics and administrative insights</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-5 flex items-center justify-between">
            <div>
              {/* Metric Label */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
              {/* Metric Value */}
              <h3 className="text-3xl font-black text-white mt-1">{kpi.value}</h3>
              {/* Trend/Status Badge */}
              <Badge variant="info" className="mt-2 text-[10px]">
                {kpi.badge}
              </Badge>
            </div>
            {/* Visual Icon */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              {kpi.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" /> Recent User Registrations
          </h2>
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">User Name</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Email</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentUsers.map((u) => (
                <tr key={u.id} className="text-sm">
                  <td className="py-4 font-bold text-white">{u.firstName} {u.surname}</td>
                  <td className="py-4 text-slate-300">{u.email}</td>
                  <td className="py-4">
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'LECTURER' ? 'info' : 'success'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {u.pendingApproval ? (
                      <Badge variant="warning">Pending Approval</Badge>
                    ) : (
                      <Badge variant="success">Approved</Badge>
                    )}
                  </td>
                  <td className="py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
