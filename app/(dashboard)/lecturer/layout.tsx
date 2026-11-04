/**
 * MODULE TITLE: Lecturer Dashboard Layout
 * Common structural wrapper for all lecturer-related pages.
 */

import React from 'react';
// Components for sidebar and top header
import { LecturerSidebar } from '@/components/lecturer/LecturerSidebar';
import { LecturerHeader } from '@/components/lecturer/LecturerHeader';
// State management for sidebar
import { SidebarProvider } from '@/components/shared/SidebarContext';

export default function LecturerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Root layout container with dark theme */}
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex">
        {/* Navigation sidebar on the left */}
        <LecturerSidebar />
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
          {/* Global header for lecturer section */}
          <LecturerHeader />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {/* Inject sub-page content here */}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
