import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const lecturerId = Number(userObj.id);

    if (role !== 'LECTURER' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const courseId = formData.get('courseId') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file || !title || !courseId) {
      return NextResponse.json({ success: false, message: 'File, Title and Course selection are required.' }, { status: 400 });
    }

    // Process file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/materials/${filename}`;

    const material = await prisma.material.create({
      data: {
        title: title.trim(),
        description: description || null,
        courseId: Number(courseId),
        uploaderId: lecturerId,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        isPublic,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Course material uploaded successfully.',
      material,
    });
  } catch (error: any) {
    console.error('Upload Material API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
