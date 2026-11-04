// MODULE: System Activity Audit - Detailed log of system events and user actions.
import React from 'react';
// Imports database connection to fetch activity logs
import prisma from '@/lib/prisma';
// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Icons for scanning log list
import { Activity, ShieldCheck, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminActivityPage() {
  // Fetch the 50 most recent system events including user details
  const logs = await prisma.log.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      {/* Header section with title and log count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">Audit trail of security events and user actions</p>
        </div>
        <Badge variant="info" className="px-3 py-1">
          {logs.length} Recent Logs
        </Badge>
      </div>

      {/* Activity Logs Table */}
      <Card className="p-6">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Time</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">User</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Action</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Level</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="text-sm">
                  <td className="py-4 text-slate-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-4 font-bold text-white">
                    {log.user ? `${log.user.firstName} ${log.user.surname}` : 'System'}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-semibold">{log.action}</span>
                      {log.meta && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {JSON.stringify(log.meta)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant={log.level === 'ERROR' ? 'danger' : log.level === 'WARNING' ? 'warning' : 'info'}>
                      {log.level}
                    </Badge>
                  </td>
                  <td className="py-4 font-mono text-xs text-slate-400">{log.ip || '127.0.0.1'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
