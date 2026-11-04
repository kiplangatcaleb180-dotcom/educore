import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import NotificationList from '@/components/shared/NotificationList';

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const adminId = userObj?.id ? Number(userObj.id) : null;

  if (!adminId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const notifications = await prisma.notification.findMany({
    where: { userId: adminId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 text-sky-400">
            <Bell className="w-8 h-8" /> System Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">Updates on user registrations, system logs, and administrative tasks</p>
        </div>
      </div>

      <NotificationList initialNotifications={notifications as any} themeColor="sky" />
    </div>
  );
}
