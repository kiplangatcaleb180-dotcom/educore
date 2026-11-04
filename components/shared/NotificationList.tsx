'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, Clock, Info, AlertTriangle, CheckCircle2, Trash2, Megaphone, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
}

export default function NotificationList({
  initialNotifications,
  themeColor = 'indigo'
}: {
  initialNotifications: Notification[],
  themeColor?: 'indigo' | 'sky' | 'emerald'
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        router.refresh();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;

    setIsClearing(true);
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      if (res.ok) {
        setNotifications([]);
        router.refresh();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'message': return <Bell className="w-5 h-5 text-indigo-500" />;
      case 'broadcast': return <Megaphone className="w-5 h-5 text-indigo-400" />;
      default: return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const themeClasses = {
    indigo: 'border-indigo-500 bg-indigo-500/5',
    sky: 'border-sky-500 bg-sky-500/5',
    emerald: 'border-emerald-500 bg-emerald-500/5',
  };

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={isClearing}
            className="text-red-400 border-red-500/20 hover:bg-red-500/5 gap-2"
          >
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Clear All
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((n) => (
          <Card
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`p-4 border-l-4 transition-all hover:bg-slate-800/40 cursor-pointer ${n.isRead ? 'border-slate-800' : themeClasses[themeColor] + ' shadow-lg shadow-' + themeColor + '-500/5'}`}
          >
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-lg ${n.isRead ? 'bg-slate-800 text-slate-500' : 'bg-' + themeColor + '-500/10'}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`font-bold text-sm truncate ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                    {n.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase whitespace-nowrap">
                      <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(n.createdAt))} ago
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {n.message}
                </p>
                {!n.isRead && (
                  <Badge variant="info" className="mt-3 text-[9px] px-2 py-0 border-indigo-500/30">NEW</Badge>
                )}
              </div>
            </div>
          </Card>
        )) : (
          <div className="py-24 text-center text-slate-600 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">Everything is up to date</h3>
            <p className="text-sm max-w-xs mx-auto mt-2 text-slate-500">
              When important updates occur, they'll appear here for your attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
