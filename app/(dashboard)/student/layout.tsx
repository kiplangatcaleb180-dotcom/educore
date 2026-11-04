// Student Dashboard Layout: Common structure for student-facing pages.
import React from 'react';
// Components for sidebar and top header
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { StudentHeader } from '@/components/student/StudentHeader';
// State management for sidebar
import { SidebarProvider } from '@/components/shared/SidebarContext';
// Auth and navigation tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <SidebarProvider>
      {/* Root layout container with dark theme */}
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex">
        {/* Render sidebar only if student has completed department setup */}
        {user?.departmentId && <StudentSidebar />}
        <div className={user?.departmentId ? "flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300" : "flex-1 flex flex-col min-w-0"}>
          {/* Global header for student section */}
          <StudentHeader />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
