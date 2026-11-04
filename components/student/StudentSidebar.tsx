// StudentSidebar: Navigation drawer providing access to learning tools and resources.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Comprehensive set of icons for student modules
import {
  LayoutDashboard,
  FileCheck2,
  FileText,
  FolderDown,
  ClipboardCheck,
  Calendar,
  Video,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  TrendingUp,
  Bell,
  MessageSquare,
  UserCheck,
  X
} from 'lucide-react';
// Authentication and UI utility tools
import { signOut } from 'next-auth/react';
import { useSidebar } from '../shared/SidebarContext';
import { cn } from '@/lib/utils';

export const StudentSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();

  // Definition of navigation links in the student portal
  const navItems = [
    { href: '/student', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/student/live-classes', label: 'Live Classes', icon: <Video className="w-5 h-5" /> },
    { href: '/student/exams', label: 'My CATs & Exams', icon: <FileCheck2 className="w-5 h-5" /> },
    { href: '/student/results', label: 'My Results', icon: <Award className="w-5 h-5" /> },
    { href: '/student/performance', label: 'Performance', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/student/assignments', label: 'Assignments', icon: <FileText className="w-5 h-5" /> },
    { href: '/student/materials', label: 'Study Library', icon: <FolderDown className="w-5 h-5" /> },
    { href: '/student/attendance', label: 'My Attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { href: '/student/roll-call', label: 'Roll Call', icon: <UserCheck className="w-5 h-5" /> },
    { href: '/student/consultations', label: 'Consultations', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/student/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/student/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { href: '/student/timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Semi-transparent background shown behind the sidebar on mobile devices */}
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
              {/* Brand logo for the student portal */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                  StudentPortal
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase mt-0.5 tracking-wider">
                  Educore
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center">
            {/* Desktop collapse button to minimize the sidebar */}
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

        {/* List of navigational modules for the student */}
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
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
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

        {/* Footer section containing the sign-out button */}
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
