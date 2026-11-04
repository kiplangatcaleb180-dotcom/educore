import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import SubmitAssignmentClient from './SubmitAssignmentClient';

export default async function SubmitAssignmentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { id } = await params;
  const assignmentId = Number(id);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: true },
  });

  if (!assignment) notFound();

  return (
    <SubmitAssignmentClient assignment={assignment as any} />
  );
}
