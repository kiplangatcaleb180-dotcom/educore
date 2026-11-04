// Module Title: Student Profile Setup System
// Interface for new students to complete their academic profiles.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons and Session tools
import { GraduationCap, Building2, UserCircle, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Faculty {
  id: number;
  name: string;
  code: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  facultyId: number;
}

export const StudentSetupForm: React.FC = () => {
  const router = useRouter();
  const { update } = useSession();
  // State for form data and choices
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [regNumber, setRegNumber] = useState('');

  // Process and status states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch initial campus data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Retrieves faculties and departments from the server
  const fetchData = async () => {
    try {
      const [facRes, deptRes] = await Promise.all([
        fetch('/api/admin/faculties'),
        fetch('/api/admin/departments')
      ]);
      const facData = await facRes.json();
      const deptData = await deptRes.json();

      if (facData.success) setFaculties(facData.faculties);
      if (deptData.success) setDepartments(deptData.departments);
    } catch (err) {
      setError('Failed to load campus data.');
    } finally {
      setFetching(false);
    }
  };

  // Filter departments based on selected faculty
  const filteredDepts = departments.filter(d => d.facultyId === Number(selectedFacultyId));

  // Handles final form submission to save student profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/student/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          studentId: regNumber
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Update failed.');
      } else {
        setSuccess(true);
        // Refresh session to include new departmentId and studentId
        await update({
          departmentId: Number(selectedDeptId),
          studentId: regNumber
        });
        // Delay redirect to show success message
        setTimeout(() => {
          router.push('/student');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching initial data
  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-slate-400 text-sm">Initializing your profile...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-xl mx-auto p-8 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="text-center mb-8">
        {/* Header icon and title */}
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto mb-4">
          <UserCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Complete Your Profile</h1>
        <p className="text-sm text-slate-400 mt-2">
          Please select your academic details to access your dashboard.
        </p>
      </div>

      {success ? (
        <div className="text-center py-8 space-y-4">
          {/* Success feedback state */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">Profile Completed!</h3>
          <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error feedback if save fails */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Academic Faculty</label>
              {/* Faculty selection dropdown */}
              <select
                value={selectedFacultyId}
                onChange={(e) => {
                    setSelectedFacultyId(Number(e.target.value));
                    setSelectedDeptId('');
                }}
                required
                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              >
                <option value="">Select Faculty...</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Department / Specialization</label>
              {/* Department selection dropdown, filtered by faculty */}
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                required
                disabled={!selectedFacultyId}
                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Department...</option>
                {filteredDepts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <Input
              label="Official Registration Number"
              placeholder="e.g. STU/2026/0001"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold shadow-sky-500/10">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
          </Button>
        </form>
      )}
    </Card>
  );
};
