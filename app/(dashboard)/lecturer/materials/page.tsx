/**
 * MODULE TITLE: Lecturer Materials Management Page
 * Handles the display and organization of course study materials.
 */

import React from 'react';
// Database tool
import prisma from '@/lib/prisma';
// Authentication and session tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Client component for material browsing and uploads
import LecturerMaterialsClient from './LecturerMaterialsClient';

export default async function LecturerMaterialsPage() {
  const session = await getServerSession(authOptions);
  const userObj = session?.user as any;
  const lecturerId = userObj?.id ? Number(userObj.id) : null;

  if (!lecturerId) return null;

  // Parallel database fetch for uploaded materials and assigned courses
  const [materials, courses] = await Promise.all([
    // Retrieve all files uploaded by the lecturer
    prisma.material.findMany({
      where: { uploaderId: lecturerId },
      include: {
        course: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Retrieve courses taught by the lecturer for file categorization
    prisma.course.findMany({
      where: { lecturerId },
      select: { id: true, code: true, name: true }
    })
  ]);

  return (
    <LecturerMaterialsClient
      courses={courses as any}
      initialMaterials={materials as any}
    />
  );
}
