import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Bell } from 'lucide-react';
import NotificationList from '@/components/shared/NotificationList';

export default async function StudentNotificationsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const notifications = await prisma.notification.findMany({
    where: { userId: studentId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Bell className="w-8 h-8 text-indigo-400" /> Notifications
        </h1>
        <p className="text-sm text-slate-400 mt-1">Stay updated with the latest alerts and announcements</p>
      </div>

      <NotificationList initialNotifications={notifications as any} themeColor="indigo" />
    </div>
  );
}
