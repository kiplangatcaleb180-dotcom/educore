'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { GraduationCap, LogIn, UserPlus, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'superadmin') return '/admin';
    if (role === 'lecturer') return '/lecturer';
    if (role === 'student') return '/student';
    return '/login';
  };

  const dashboardLink = getDashboardLink();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070a13]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight leading-none">
              Educore<span className="text-sky-400">Hub</span>
            </span>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">
              Enterprise LMS
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href ? 'text-sky-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            {status === 'authenticated' ? (
              <>
                <Link href={dashboardLink}>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 border border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" /> Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070a13] border-t border-slate-800 px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-bold px-2 py-1 transition-colors ${
                  pathname === link.href ? 'text-sky-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {status === 'authenticated' ? (
              <>
                <Link href={dashboardLink} className="w-full">
                  <Button variant="primary" className="w-full py-4 text-lg gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-5 h-5" /> My Dashboard
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full py-4 text-lg gap-2 text-red-400"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <Button variant="secondary" className="w-full py-4 text-lg">Log In</Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button variant="primary" className="w-full py-4 text-lg">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
