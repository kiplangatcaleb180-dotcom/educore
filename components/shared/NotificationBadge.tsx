'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const NotificationBadge: React.FC<{ href: string }> = ({ href }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  useEffect(() => {
    fetchCount();
    // Refresh count when navigating or every 2 minutes
    const interval = setInterval(fetchCount, 120000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <Link href={href}>
      <button className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
};
