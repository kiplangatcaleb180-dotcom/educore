// Module Title: Admin User Management Portal
// Interface for managing campus accounts, approvals, and permissions.

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Ban,
  UserCog
} from 'lucide-react';

interface UserRecord {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  role: string;
  studentId: string | null;
  staffId: string | null;
  pendingApproval: boolean;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date | string;
  departmentId?: number | null;
}

interface AdminUsersClientProps {
  initialUsers: UserRecord[];
  departments: { id: number; name: string; code: string }[];
}

export const AdminUsersClient: React.FC<AdminUsersClientProps> = ({ initialUsers, departments }) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'LECTURERS' | 'STUDENTS' | 'BLOCKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  // Calculates the filtered user list based on search and tab selections
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.surname}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.staffId && u.staffId.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 'PENDING') matchesTab = u.pendingApproval;
      if (activeTab === 'LECTURERS') matchesTab = u.role === 'LECTURER';
      if (activeTab === 'STUDENTS') matchesTab = u.role === 'STUDENT';
      if (activeTab === 'BLOCKED') matchesTab = u.isBlocked;

      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;

      return matchesSearch && matchesTab && matchesRole;
    });
  }, [users, activeTab, searchTerm, selectedRole]);

  // Key performance indicators for the user base
  const totalUsers = users.length;
  const pendingCount = users.filter((u) => u.pendingApproval).length;
  const activeCount = users.filter((u) => u.isActive && !u.isBlocked).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  // Handles API calls for administrative user actions
  const handleUserAction = async (
    userId: number,
    action: 'APPROVE' | 'DECLINE' | 'TOGGLE_BLOCK' | 'CHANGE_ROLE' | 'TOGGLE_ACTIVE' | 'UPDATE_DEPARTMENT',
    extraData?: { newRole?: string; isBlocked?: boolean; isActive?: boolean; departmentId?: number | null }
  ) => {
    if (action === 'DECLINE' && !window.confirm('Are you sure you want to decline this registration?')) return;

    setLoadingUserId(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          ...extraData,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u))
        );
        router.refresh();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      alert('Error updating user status.');
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management Portal</h1>
        <p className="text-sm text-slate-400 mt-1">
          Approve pending registrations, manage user roles, and control campus access.
        </p>
      </div>

      {/* Grid of summary cards showing system stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalUsers}</h3>
            <span className="text-[11px] text-sky-400 font-semibold mt-1 inline-block">Campus Accounts</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Users className="w-6 h-6 text-sky-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-amber-500/30">
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-3xl font-black text-white mt-1">{pendingCount}</h3>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">Awaiting Admin Action</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-3xl font-black text-white mt-1">{activeCount}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Unblocked & Active</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blocked Accounts</p>
            <h3 className="text-3xl font-black text-white mt-1">{blockedCount}</h3>
            <span className="text-[11px] text-red-400 font-semibold mt-1 inline-block">Suspended Access</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <UserX className="w-6 h-6 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Search and Category Filter section */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            All Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending Approvals ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab('LECTURERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'LECTURERS'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Lecturers ({users.filter((u) => u.role === 'LECTURER').length})
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'STUDENTS'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Students ({users.filter((u) => u.role === 'STUDENT').length})
          </button>

          <button
            onClick={() => setActiveTab('BLOCKED')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'BLOCKED'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Blocked ({blockedCount})
          </button>
        </div>

        {/* Text search and role dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Search Name, Email, Student/Staff ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
            >
              <option value="ALL">Filter by Role (All)</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main listing of registered users */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Registered Users Roster</h2>
          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">ID / Staff ID</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Full Name</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Email</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Department</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="text-sm">
                  <td className="py-4 font-mono text-xs text-sky-400 font-bold">
                    {u.studentId || u.staffId || `#${u.id}`}
                  </td>
                  <td className="py-4 font-bold text-white">
                    {u.firstName} {u.surname}
                  </td>
                  <td className="py-4 text-slate-300 truncate max-w-[150px]">{u.email}</td>
                  <td className="py-4">
                    <select
                      value={u.role}
                      disabled={loadingUserId === u.id}
                      onChange={(e) =>
                        handleUserAction(u.id, 'CHANGE_ROLE', { newRole: e.target.value })
                      }
                      className="bg-slate-900 text-[10px] font-bold text-sky-400 border border-slate-700 rounded-md px-1.5 py-1 focus:outline-none"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="LECTURER">LECTURER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <select
                      value={u.departmentId || ''}
                      disabled={loadingUserId === u.id}
                      onChange={(e) =>
                        handleUserAction(u.id, 'UPDATE_DEPARTMENT', { departmentId: e.target.value ? Number(e.target.value) : null })
                      }
                      className="bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-700 rounded-md px-1.5 py-1 focus:outline-none w-full max-w-[120px]"
                    >
                      <option value="">No Dept</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.code}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4">
                    {u.isBlocked ? (
                      <Badge variant="danger">Blocked</Badge>
                    ) : u.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.pendingApproval && (
                        <>
                          <Button
                            size="sm"
                            disabled={loadingUserId === u.id}
                            onClick={() => handleUserAction(u.id, 'APPROVE')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 text-xs gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={loadingUserId === u.id}
                            onClick={() => handleUserAction(u.id, 'DECLINE')}
                            className="text-red-400 border-red-500/20 hover:bg-red-500/5 px-2.5 py-1 text-xs gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant={u.isBlocked ? 'outline' : 'danger'}
                        disabled={loadingUserId === u.id}
                        onClick={() =>
                          handleUserAction(u.id, 'TOGGLE_BLOCK', { isBlocked: !u.isBlocked })
                        }
                        className="px-2.5 py-1 text-xs gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No registered users match the selected tab or search criteria.
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
