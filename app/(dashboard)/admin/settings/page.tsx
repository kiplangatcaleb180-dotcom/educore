// MODULE: System Settings Page - UI for administrators to configure global preferences.
'use client';

import React from 'react';
// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons
import { ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header with title and description */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure campus parameters, authentication rules, and notifications</p>
      </div>

      {/* Security & Registration Policy section */}
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" /> Security & Registration Policy
        </h3>

        <div className="space-y-4">
          <Input label="Platform Name" defaultValue="EducoreHub Enterprise LMS" />
          <Input label="System Administrator Email" defaultValue="ciphersentinel@yahoo.com" />
        </div>

        {/* Action footer for saving settings */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button>Save System Settings</Button>
        </div>
      </Card>
    </div>
  );
}
