// Registration Page Module: Allows new students and lecturers to create an account.
'use client';

import React, { useState } from 'react';
// UI and Navigation tools
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Icons
import { GraduationCap, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  // Form state management
  const [role, setRole] = useState<'STUDENT' | 'LECTURER'>('STUDENT');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handles the submission of the registration form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sends registration data to the backend API
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          password,
          role,
          idNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-[#070a13]" />

      <Card className="w-full max-w-lg p-8 relative z-10 border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-xl">
        <div className="text-center mb-8">
          {/* Brand logo linked to home */}
          <Link href="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Campus Account</h1>
          <p className="text-sm text-slate-400 mt-1">Register for Student or Lecturer access</p>
        </div>

        {success ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            {/* Success message shown after registration */}
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Registration Submitted!</h3>
            <p className="text-xs text-slate-300">
              Your registration is pending administrator approval. You will be able to log in once approved.
            </p>
            <Link href="/login">
              <Button className="w-full mt-2">Return to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display error message if registration fails */}
            {error && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Account type selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  role === 'STUDENT' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setRole('STUDENT')}
              >
                Student Registration
              </button>
              <button
                type="button"
                className={`py-2 text-xs font-bold rounded-md transition-all ${
                  role === 'LECTURER' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setRole('LECTURER')}
              >
                Lecturer Registration
              </button>
            </div>

            {/* Input fields for personal details */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Surname"
                placeholder="Doe"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john.doe@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label={role === 'STUDENT' ? 'Student ID' : 'Staff ID'}
              placeholder={role === 'STUDENT' ? 'STU-2026-001' : 'LEC-2026-001'}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full h-11 text-base mt-4">
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>
        )}

        {/* Link back to login page */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-sky-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
