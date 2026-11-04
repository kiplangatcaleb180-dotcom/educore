// Login Page Module: Handles user authentication for students and staff.

'use client';

import React, { useState } from 'react';
// Navigation and authentication hooks
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
// Icons and UI Components
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  // Form input and process state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles the sign-in form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticates the user with email and password
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.ok) {
        // Fetch session to determine role-based portal redirect
        const session = await getSession();
        const role = ((session?.user as any)?.role || '').toUpperCase();

        // Redirect user to their respective dashboard based on role
        if (role === 'ADMIN' || role === 'SUPERADMIN') {
          router.push('/admin');
        } else if (role === 'LECTURER') {
          router.push('/lecturer');
        } else if (role === 'STUDENT') {
          router.push('/student');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected login error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-slate-950 to-[#070a13]" />

      <Card className="w-full max-w-md p-8 relative z-10 border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-xl">

        <div className="text-center mb-8">
          {/* Brand header with logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Sign In to EducoreHub</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your credentials to access your campus portal</p>
        </div>

        {/* Display login error message if authentication fails */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="ciphersentinel@yahoo.com or ronaldkoech64@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {/* Submit button with loading state */}
          <Button type="submit" disabled={loading} className="w-full h-11 text-base mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" /> Sign In
              </span>
            )}
          </Button>
        </form>

        {/* Link to account registration */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-sky-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
}
