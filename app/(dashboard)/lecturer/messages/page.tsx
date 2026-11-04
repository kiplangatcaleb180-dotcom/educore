import React from 'react';
import ChatInterface from '@/components/shared/ChatInterface';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LecturerMessagesPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  const courses = await prisma.course.findMany({
    where: { lecturerId },
    select: { id: true, code: true, name: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight text-indigo-400">Messaging Center</h1>
        <p className="text-sm text-slate-400 mt-1">Connect with students and manage academic discussions</p>
      </div>
      <ChatInterface userRole="LECTURER" lecturerCourses={courses as any} />
    </div>
  );
}
