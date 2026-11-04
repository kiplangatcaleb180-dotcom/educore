// AdminHeader: Provides the top navigation bar for administrators.
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Icons and UI components
import { Bell, ShieldCheck, Menu, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
// Context and modals
import { useSidebar } from '../shared/SidebarContext';
import { BroadcastModal } from '../shared/BroadcastModal';
import { NotificationBadge } from '../shared/NotificationBadge';

export const AdminHeader: React.FC = () => {
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* System status badge */}
        <Badge variant="info" className="bg-sky-500/10 text-sky-400 border-sky-500/20 hidden sm:flex">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> System Administration
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* System-wide broadcast trigger */}
        <button
          onClick={() => setBroadcastOpen(true)}
          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2 px-3"
        >
          <Megaphone className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Broadcast</span>
        </button>

        {/* Notifications shortcut */}
        <NotificationBadge href="/admin/notifications" />

        {/* User profile summary and separator */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {session?.user?.name ? session.user.name.charAt(0) : 'A'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white leading-tight">
              {session?.user?.name || 'Administrator'}
            </span>
            <span className="text-[11px] text-sky-400 font-medium">
              System Admin
            </span>
          </div>
        </div>
      </div>

      {/* Global announcement creation modal */}
      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        userRole={(session?.user as any)?.role || 'ADMIN'}
      />
    </header>
  );
};
