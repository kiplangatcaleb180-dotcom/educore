import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import BroadcastClient from './BroadcastClient';
import NotificationList from '@/components/shared/NotificationList';

export default async function LecturerNotificationsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const [notifications, courses] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: lecturerId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.findMany({
      where: { lecturerId },
      select: { id: true, code: true, name: true }
    })
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-400" /> Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">Updates on submissions, class activities, and admin alerts</p>
        </div>
      </div>

      <BroadcastClient courses={courses as any} />

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4 mt-12">
           <Bell className="w-5 h-5 text-slate-500" />
           <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px] text-slate-500">Recent Alerts</h2>
        </div>
        <NotificationList initialNotifications={notifications as any} themeColor="indigo" />
      </div>
    </div>
  );
}
