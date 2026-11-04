import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userObj = session.user as any;
    const role = (userObj.role || '').toUpperCase();
    const userId = Number(userObj.id);

    if (role !== 'ADMIN' && role !== 'SUPERADMIN' && role !== 'LECTURER') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { title, content, courseId, targetRole } = await req.json();

    console.log('Broadcast Request:', { title, content, courseId, targetRole, userId, role });

    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Title and Content are required.' }, { status: 400 });
    }

    // Save broadcast record
    let broadcast;
    try {
        broadcast = await prisma.broadcastMessage.create({
            data: {
                senderId: userId,
                title,
                content,
                courseId: courseId ? Number(courseId) : null,
                targetRole: targetRole ? (targetRole as any) : null,
            },
        });
    } catch (dbError: any) {
        console.error('Database error saving broadcast record:', dbError);
        return NextResponse.json({
            success: false,
            message: `Failed to save broadcast record: ${dbError.message}`
        }, { status: 500 });
    }

    // Find target users
    let targetUserIds: number[] = [];

    try {
        if (courseId) {
            // Broadcast to students in a specific course
            const enrollments = await prisma.courseEnrollment.findMany({
                where: { courseId: Number(courseId) },
                select: { studentId: true }
            });
            targetUserIds = enrollments.map(e => e.studentId);
        } else if (role === 'LECTURER') {
            // Lecturer broadcasting to ALL their students
            const myCourses = await prisma.course.findMany({
                where: { lecturerId: userId },
                select: { enrollments: { select: { studentId: true } } }
            });
            const idSet = new Set<number>();
            myCourses.forEach(c => c.enrollments.forEach(e => idSet.add(e.studentId)));
            targetUserIds = Array.from(idSet);
        } else {
            // Admin broadcasting
            if (targetRole) {
                const users = await prisma.user.findMany({
                    where: { role: targetRole as any },
                    select: { id: true }
                });
                targetUserIds = users.map(u => u.id);
            } else {
                // All users if no role specified
                const users = await prisma.user.findMany({
                    select: { id: true }
                });
                targetUserIds = users.map(u => u.id);
            }
        }

        console.log(`Found ${targetUserIds.length} target users for broadcast.`);

        // Create notifications for each target user
        if (targetUserIds.length > 0) {
            // Chunk the createMany to avoid large payload issues
            const chunkSize = 500;
            for (let i = 0; i < targetUserIds.length; i += chunkSize) {
                const chunk = targetUserIds.slice(i, i + chunkSize);
                await prisma.notification.createMany({
                    data: chunk.map(id => ({
                        userId: id,
                        title: `Broadcast: ${title}`,
                        message: content,
                        type: 'broadcast',
                        isRead: false,
                        createdAt: new Date()
                    })),
                    skipDuplicates: true
                });
            }
        }
    } catch (innerError: any) {
        console.error('Error calculating targets or creating notifications:', innerError);
        return NextResponse.json({
            success: false,
            message: `Broadcast recorded, but failed to notify users: ${innerError.message}`
        }, { status: 500 });
    }

    await logActivity({
        userId,
        action: 'SEND_BROADCAST',
        level: 'INFO',
        meta: { broadcastId: broadcast.id, title, recipientCount: targetUserIds.length }
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${targetUserIds.length} users.`,
    });
  } catch (error: any) {
    console.error('Broadcast API error:', error);
    return NextResponse.json({
        success: false,
        message: `Internal server error: ${error.message}`
    }, { status: 500 });
  }
}
