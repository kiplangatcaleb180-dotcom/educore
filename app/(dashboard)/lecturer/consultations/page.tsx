import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LecturerConsultationClient from './LecturerConsultationClient';

export default async function LecturerConsultationsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const consultations = await prisma.consultation.findMany({
    where: { lecturerId },
    include: { student: { select: { firstName: true, surname: true, studentId: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Consultations</h1>
        <p className="text-sm text-slate-400 mt-1">Manage and respond to academic support requests from your students</p>
      </div>
      <LecturerConsultationClient initialConsultations={consultations as any} />
    </div>
  );
}
