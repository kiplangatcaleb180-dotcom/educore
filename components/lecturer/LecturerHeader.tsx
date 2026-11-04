// LecturerHeader: Top navigation bar for lecturers with broadcast and notifications.
'use client';

import React, { useState, useEffect } from 'react';
// Hooks for session management
import { useSession } from 'next-auth/react';
// Components for navigation and icons
import Link from 'next/link';
import { Bell, GraduationCap, Menu, Megaphone } from 'lucide-react';
// Internal UI components and context
import { Badge } from '@/components/ui/Badge';
import { useSidebar } from '../shared/SidebarContext';
import { BroadcastModal } from '../shared/BroadcastModal';
import { NotificationBadge } from '../shared/NotificationBadge';

export const LecturerHeader: React.FC = () => {
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Retrieves the courses assigned to the current lecturer
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/lecturer/courses');
        const data = await res.json();
        if (data.success) setCourses(data.courses);
      } catch (err) {
        console.error('Error fetching lecturer courses', err);
      }
    };
    if (session?.user) fetchCourses();
  }, [session]);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Faculty identification badge */}
        <Badge variant="info" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hidden sm:flex">
          <GraduationCap className="w-3.5 h-3.5 mr-1" /> Faculty Instructor
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Broadcast announcement creation button */}
        <button
          onClick={() => setBroadcastOpen(true)}
          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2 px-3"
        >
          <Megaphone className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Broadcast</span>
        </button>

        {/* Notifications center link */}
        <NotificationBadge href="/lecturer/notifications" />

        {/* User profile summary section */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {session?.user?.name ? session.user.name.charAt(0) : 'L'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white leading-tight">
              {session?.user?.name || 'Lecturer'}
            </span>
            <span className="text-[11px] text-indigo-400 font-medium">
              Academic Faculty
            </span>
          </div>
        </div>
      </div>

      {/* Pop-up modal for creating announcements */}
      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        userRole={(session?.user as any)?.role || 'LECTURER'}
        courses={courses}
      />
    </header>
  );
};
