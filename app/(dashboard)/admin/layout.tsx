// MODULE: Admin Dashboard Layout - Common visual structure for the administrator section.
import React from 'react';
// Sidebar navigation menu for administrators
import { AdminSidebar } from '@/components/admin/AdminSidebar';
// Top header bar for global info and user profile
import { AdminHeader } from '@/components/admin/AdminHeader';
// State manager for sidebar visibility
import { SidebarProvider } from '@/components/shared/SidebarContext';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Main container with theme colors and layout */}
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex">
        {/* Left-side sidebar navigation */}
        <AdminSidebar />
        {/* Right-side main content area */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
          {/* Top global header */}
          <AdminHeader />
          {/* Main scrollable page content */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
