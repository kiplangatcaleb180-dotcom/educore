// StudentHeader: Provides the top navigation bar for students.
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Icons and UI Components
import { Bell, GraduationCap, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useSidebar } from '../shared/SidebarContext';
import { NotificationBadge } from '../shared/NotificationBadge';

export const StudentHeader: React.FC = () => {
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const user = session?.user as any;
  // Determine if the student is currently setting up their account
  const isSetupMode = user && user.role === 'STUDENT' && !user.departmentId;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Render mobile menu toggle if not in initial setup mode */}
        {!isSetupMode && (
          <button
            onClick={toggle}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {/* Student portal identity badge */}
        <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hidden sm:flex">
          <GraduationCap className="w-3.5 h-3.5 mr-1" /> Student Learning Portal
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications shortcut for fully registered students */}
        {!isSetupMode && (
          <NotificationBadge href="/student/notifications" />
        )}

        {/* User identification and status summary */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {session?.user?.name ? session.user.name.charAt(0) : 'S'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white leading-tight">
              {session?.user?.name || 'Student'}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              Enrolled Student
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
