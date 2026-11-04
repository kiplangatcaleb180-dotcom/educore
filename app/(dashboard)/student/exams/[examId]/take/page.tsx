import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { TakeExamClient } from './TakeExamClient';

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const resolvedParams = await params;
  const examId = Number(resolvedParams.examId);

  if (isNaN(examId)) {
    notFound();
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: { select: { code: true, name: true } },
      questions: { orderBy: { id: 'asc' } },
    },
  });

  if (!exam || !exam.isOpen) {
    notFound();
  }

  return (
    <TakeExamClient
      exam={{
        id: exam.id,
        title: exam.title,
        code: exam.code,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        course: exam.course,
        questions: exam.questions,
      }}
    />
  );
}
