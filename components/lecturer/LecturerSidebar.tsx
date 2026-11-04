// LecturerSidebar: Side navigation menu for managing academic tasks.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Set of icons for the navigation menu
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileCheck2,
  FileText,
  FolderDown,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Bell,
  Award,
  X
} from 'lucide-react';
// Auth and context tools
import { signOut } from 'next-auth/react';
import { useSidebar } from '../shared/SidebarContext';
import { cn } from '@/lib/utils';

export const LecturerSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();

  // List of all functional modules in the lecturer portal
  const navItems = [
    { href: '/lecturer', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/lecturer/students', label: 'My Students', icon: <Users className="w-5 h-5" /> },
    { href: '/lecturer/classes', label: 'Classes & Courses', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/lecturer/exams', label: 'CATs & Exams', icon: <FileCheck2 className="w-5 h-5" /> },
    { href: '/lecturer/assignments', label: 'Assignments', icon: <FileText className="w-5 h-5" /> },
    { href: '/lecturer/grades', label: 'Grades & Scoring', icon: <Award className="w-5 h-5" /> },
    { href: '/lecturer/performance', label: 'Performance Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/lecturer/consultations', label: 'Consultations', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/lecturer/materials', label: 'Course Materials', icon: <FolderDown className="w-5 h-5" /> },
    { href: '/lecturer/rollcall', label: 'Attendance Roll Call', icon: <ClipboardCheck className="w-5 h-5" /> },
    { href: '/lecturer/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/lecturer/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Dark background overlay shown when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 text-white z-40 flex flex-col transition-all duration-300",
          "w-64",
          collapsed ? "lg:w-20" : "lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {(!collapsed || isOpen) && (
            <div className="flex items-center gap-2.5">
              {/* Institutional branding logo */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                  LecturerPortal
                </span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase mt-0.5 tracking-wider">
                  Instructor
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center">
            {/* Desktop toggle to collapse the menu to icons only */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors hidden lg:block"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {/* Mobile close button for the navigation drawer */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary scrollable navigation link section */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all",
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
                title={collapsed && !isOpen ? item.label : undefined}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {(!collapsed || isOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Global sign-out footer for the portal session */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
