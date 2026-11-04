// Module Title: Admin Departments & Faculties Management System
// Allows administrators to manage academic faculties and departments.

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons
import { Building2, Plus, Users, GraduationCap, Edit, Trash2, AlertCircle, Loader2, X } from 'lucide-react';
// Utilities
import { cn } from '@/lib/utils';

interface Faculty {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  deanId?: number | null;
  dean?: { firstName: string; surname: string } | null;
  _count?: { departments: number };
}

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  facultyId?: number | null;
  faculty?: Faculty | null;
  headId?: number | null;
  head?: { firstName: string; surname: string } | null;
  _count: { courses: number; users: number };
}

interface UserOption {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  role: string;
}

interface AdminDepartmentsClientProps {
  initialDepartments: Department[];
  initialFaculties: Faculty[];
  potentialHeads: UserOption[];
}

export const AdminDepartmentsClient: React.FC<AdminDepartmentsClientProps> = ({
  initialDepartments,
  initialFaculties,
  potentialHeads,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'FACULTIES'>('DEPARTMENTS');

  // Modal visibility states
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'FACULTY' | 'DEPARTMENT'; id: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Faculty form states
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fDeanId, setFDeanId] = useState<number | ''>('');

  // Department form states
  const [dName, setDName] = useState('');
  const [dCode, setDCode] = useState('');
  const [dDesc, setDDesc] = useState('');
  const [dFacultyId, setDFacultyId] = useState<number | ''>('');
  const [dHeadId, setDHeadId] = useState<number | ''>('');

  // Prepares the faculty modal for create or edit
  const openFacultyModal = (faculty?: Faculty) => {
    setError('');
    if (faculty) {
      setEditingItem({ type: 'FACULTY', id: faculty.id });
      setFName(faculty.name);
      setFCode(faculty.code);
      setFDesc(faculty.description || '');
      setFDeanId(faculty.deanId || '');
    } else {
      setEditingItem(null);
      setFName('');
      setFCode('');
      setFDesc('');
      setFDeanId('');
    }
    setShowFacultyModal(true);
  };

  // Prepares the department modal for create or edit
  const openDepartmentModal = (dept?: Department) => {
    setError('');
    if (dept) {
      setEditingItem({ type: 'DEPARTMENT', id: dept.id });
      setDName(dept.name);
      setDCode(dept.code);
      setDDesc(dept.description || '');
      setDFacultyId(dept.facultyId || '');
      setDHeadId(dept.headId || '');
    } else {
      setEditingItem(null);
      setDName('');
      setDCode('');
      setDDesc('');
      setDFacultyId('');
      setDHeadId('');
    }
    setShowDepartmentModal(true);
  };

  // Logic to create or update a faculty
  const handleCreateOrUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isEditing = !!editingItem;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch('/api/admin/faculties', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?.id,
          name: fName,
          code: fCode,
          description: fDesc,
          deanId: fDeanId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} faculty.`);
      } else {
        router.refresh();
        setShowFacultyModal(false);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Logic to create or update a department
  const handleCreateOrUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isEditing = !!editingItem;
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch('/api/admin/departments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?.id,
          name: dName,
          code: dCode,
          description: dDesc,
          facultyId: dFacultyId || null,
          headId: dHeadId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} department.`);
      } else {
        router.refresh();
        setShowDepartmentModal(false);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Logic to handle deletion of a faculty or department
  const handleDelete = async (type: 'FACULTY' | 'DEPARTMENT', id: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`)) return;

    setLoading(true);
    const endpoint = type === 'FACULTY' ? '/api/admin/faculties' : '/api/admin/departments';

    try {
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || `Failed to delete ${type.toLowerCase()}.`);
      } else {
        router.refresh();
      }
    } catch (err) {
      alert('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Campus Organization</h1>
          <p className="text-xs text-slate-400 mt-1">Manage academic faculties and their constituent departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => openFacultyModal()} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Faculty
          </Button>
          <Button onClick={() => openDepartmentModal()} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Department
          </Button>
        </div>
      </div>

      {/* Navigation tabs between departments and faculties */}
      <div className="flex items-center gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={cn(
            "pb-3 text-sm font-bold transition-all px-1",
            activeTab === 'DEPARTMENTS' ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-400 hover:text-white"
          )}
        >
          Departments ({initialDepartments.length})
        </button>
        <button
          onClick={() => setActiveTab('FACULTIES')}
          className={cn(
            "pb-3 text-sm font-bold transition-all px-1",
            activeTab === 'FACULTIES' ? "text-sky-400 border-b-2 border-sky-400" : "text-slate-400 hover:text-white"
          )}
        >
          Faculties ({initialFaculties.length})
        </button>
      </div>

      {/* Main content area showing the selected tab list */}
      {activeTab === 'DEPARTMENTS' ? (
        <Card className="p-6">
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-800">
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Code</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Department Name</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Faculty</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Head of Dept</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Stats</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {initialDepartments.map((d) => (
                  <tr key={d.id} className="text-sm">
                    <td className="py-4 font-mono text-xs text-sky-400 font-bold">{d.code}</td>
                    <td className="py-4 font-bold text-white">{d.name}</td>
                    <td className="py-4 text-slate-300">{d.faculty?.name || 'General'}</td>
                    <td className="py-4 text-slate-300 font-semibold">
                      {d.head ? `${d.head.firstName} ${d.head.surname}` : 'Unassigned'}
                    </td>
                    <td className="py-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400">{d._count.courses} Courses</span>
                            <span className="text-[10px] text-slate-400">{d._count.users} Members</span>
                        </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openDepartmentModal(d)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete('DEPARTMENT', d.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-800">
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Code</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Faculty Name</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Dean</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Departments</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {initialFaculties.map((f) => (
                  <tr key={f.id} className="text-sm">
                    <td className="py-4 font-mono text-xs text-sky-400 font-bold">{f.code}</td>
                    <td className="py-4 font-bold text-white">{f.name}</td>
                    <td className="py-4 text-slate-300 font-semibold">
                      {f.dean ? `${f.dean.firstName} ${f.dean.surname}` : 'Unassigned'}
                    </td>
                    <td className="py-4"><Badge variant="info">{f._count?.departments || 0} Departments</Badge></td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openFacultyModal(f)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete('FACULTY', f.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Faculty editing/creation popup modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                {editingItem ? 'Edit Faculty' : 'Create New Faculty'}
              </h3>
              <button onClick={() => setShowFacultyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-xs text-red-400 border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateFaculty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Faculty Name *" placeholder="School of Engineering" value={fName} onChange={(e) => setFName(e.target.value)} required />
                <Input label="Faculty Code *" placeholder="SOE" value={fCode} onChange={(e) => setFCode(e.target.value.toUpperCase())} required />
              </div>
              <Input label="Description" placeholder="Brief description..." value={fDesc} onChange={(e) => setFDesc(e.target.value)} />

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Dean of Faculty</label>
                <select
                  value={fDeanId}
                  onChange={(e) => setFDeanId(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select Dean...</option>
                  {potentialHeads.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.surname} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowFacultyModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Save Changes' : 'Create Faculty'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Department editing/creation popup modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                {editingItem ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button onClick={() => setShowDepartmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-xs text-red-400 border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateDepartment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Department Name *" placeholder="Computer Science" value={dName} onChange={(e) => setDName(e.target.value)} required />
                <Input label="Department Code *" placeholder="CS" value={dCode} onChange={(e) => setDCode(e.target.value.toUpperCase())} required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Parent Faculty *</label>
                <select
                  value={dFacultyId}
                  onChange={(e) => setDFacultyId(Number(e.target.value))}
                  required
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select Faculty...</option>
                  {initialFaculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              <Input label="Description" placeholder="Brief description..." value={dDesc} onChange={(e) => setDDesc(e.target.value)} />

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Head of Department</label>
                <select
                  value={dHeadId}
                  onChange={(e) => setDHeadId(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select Head...</option>
                  {potentialHeads.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.surname} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowDepartmentModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Save Changes' : 'Create Department'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
