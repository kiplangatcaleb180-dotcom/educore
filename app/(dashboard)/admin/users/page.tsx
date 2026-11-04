// MODULE: User Management Page - Fetches and displays all users and departments.
import React from 'react';
// Database connection
import prisma from '@/lib/prisma';
// Interactive client-side user management component
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  // Fetch users and departments in parallel for efficiency
  const [users, departments] = await Promise.all([
    // Retrieve all users sorted by registration date
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        role: true,
        studentId: true,
        staffId: true,
        pendingApproval: true,
        isActive: true,
        isBlocked: true,
        createdAt: true,
        departmentId: true,
      },
    }),
    // Retrieve all departments for filtering
    prisma.department.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return <AdminUsersClient initialUsers={users} departments={departments} />;
}
