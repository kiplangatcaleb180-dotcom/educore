// Student Profile Setup: Assigns new student users to a department.
import React from 'react';
// Components and navigation tools
import { StudentSetupForm } from '@/components/student/StudentSetupForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentSetupPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Redirect to student dashboard if department is already assigned
  if (user && user.role === 'STUDENT' && user.departmentId) {
    redirect('/student');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Container for the multi-step setup form */}
      <div className="w-full">
        <StudentSetupForm />
      </div>
    </div>
  );
}
