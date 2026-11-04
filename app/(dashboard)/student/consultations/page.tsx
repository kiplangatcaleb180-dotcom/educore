import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ConsultationClient from './ConsultationClient';

export default async function StudentConsultationsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const studentId = userObj?.id ? Number(userObj.id) : null;

  if (!studentId) return <div className="p-8 text-center text-slate-400">Please sign in.</div>;

  const [lecturers, consultations] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'LECTURER', isActive: true, isBlocked: false },
      select: { id: true, firstName: true, surname: true, department: { select: { name: true } } },
    }),
    prisma.consultation.findMany({
      where: { studentId },
      include: { lecturer: { select: { firstName: true, surname: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Academic Consultations</h1>
        <p className="text-sm text-slate-400 mt-1">Request academic support or project guidance from your lecturers</p>
      </div>
      <ConsultationClient
        lecturers={lecturers as any}
        initialConsultations={consultations as any}
      />
    </div>
  );
}
