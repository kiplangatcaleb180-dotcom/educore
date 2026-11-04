// AdminSidebar: Provides the side navigation menu for administrator modules.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Sidebar icons
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  FileCheck2,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Bell,
  X
} from 'lucide-react';
// Auth and layout tools
import { signOut } from 'next-auth/react';
import { useSidebar } from '../shared/SidebarContext';
import { cn } from '@/lib/utils';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();

  // Navigation menu items definition
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/admin/users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/departments', label: 'Faculties & Depts', icon: <Building2 className="w-5 h-5" /> },
    { href: '/admin/courses', label: 'Courses & Units', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/admin/exams', label: 'Exams & CATs', icon: <FileCheck2 className="w-5 h-5" /> },
    { href: '/admin/activity', label: 'Audit Logs', icon: <Activity className="w-5 h-5" /> },
    { href: '/admin/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile dark overlay shown when sidebar is open on small screens */}
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
        {/* Sidebar Header with brand logo and collapse toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {(!collapsed || isOpen) && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                  AdminPortal
                </span>
                <span className="text-[10px] font-bold text-sky-400 uppercase mt-0.5 tracking-wider">
                  Educore
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center">
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors hidden lg:block"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable navigation section */}
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
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
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

        {/* Bottom sign-out button section */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
