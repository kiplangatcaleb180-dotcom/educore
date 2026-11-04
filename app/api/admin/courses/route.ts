/**
 * Module Title: Course Management API
 * Purpose: This file provides the backend logic for administrators to create new courses,
 * assign lecturers to courses, and enroll students into courses.
 */

// import standard tools for sending web responses
import { NextResponse } from 'next/server';
// import tools to check who is currently logged into the system
import { getServerSession } from 'next-auth';
// import the settings used for managing user sessions
import { authOptions } from '@/lib/auth';
// import the database connection tool to save and retrieve data
import prisma from '@/lib/prisma';
// import a tool to record what actions users perform for security tracking
import { logActivity } from '@/lib/logger';

// POST: Create Course - this function handles requests to create a new course
export async function POST(req: Request) {
  try {
    // get information about the person making the request to see if they are logged in
    const session = await getServerSession(authOptions);
    // if the person is not logged in, stop and tell them they are unauthorized
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // convert the user information into a format we can easily read
    const userObj = session.user as any;
    // get the user's role (like ADMIN) and make it uppercase for consistency
    const role = (userObj.role || '').toUpperCase();

    // if the user is not an Admin or SuperAdmin, stop and tell them they don't have permission
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    // extract the course details (like name and credits) sent from the web form
    const { code, name, description, credits, departmentId, lecturerId } = await req.json();

    // if the course code or name is missing, stop and tell them it's required
    if (!code || !name) {
      return NextResponse.json({ success: false, message: 'Course Code and Name are required.' }, { status: 400 });
    }

    // remove extra spaces from the code and make it uppercase
    const normalizedCode = code.trim().toUpperCase();

    // check the database to see if a course with this code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: normalizedCode },
    });

    // if the course already exists, stop and tell them they can't create it again
    if (existingCourse) {
      return NextResponse.json({ success: false, message: 'A course with this code already exists.' }, { status: 400 });
    }

    // create the new course record in the database with the provided information
    const course = await prisma.course.create({
      data: {
        code: normalizedCode,
        name: name.trim(),
        description: description || null,
        credits: credits ? Number(credits) : 3,
        departmentId: departmentId ? Number(departmentId) : null,
        lecturerId: lecturerId ? Number(lecturerId) : null,
      },
    });

    // record that an admin just created a new course for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'COURSE_CREATE',
      level: 'INFO',
      meta: { courseId: course.id, code: course.code, name: course.name },
    });

    // send a success message back to the web browser along with the new course data
    return NextResponse.json({
      success: true,
      message: 'Course created successfully.',
      course,
    });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Create Course API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH: Reassign Lecturer or Enroll Student - this function handles updates to existing courses
export async function PATCH(req: Request) {
  try {
    // get information about the person making the request to see if they are logged in
    const session = await getServerSession(authOptions);
    // if the person is not logged in, stop and tell them they are unauthorized
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // convert the user information into a format we can easily read
    const userObj = session.user as any;
    // get the user's role (like ADMIN) and make it uppercase for consistency
    const role = (userObj.role || '').toUpperCase();

    // if the user is not an Admin or SuperAdmin, stop and tell them they don't have permission
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    // extract what action to take and the IDs of the course, lecturer, or student
    const { action, courseId, lecturerId, studentId } = await req.json();

    // if the course ID is missing, stop and tell them it's required
    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Course ID is required.' }, { status: 400 });
    }

    // if the admin wants to assign a lecturer to a course
    if (action === 'ASSIGN_LECTURER') {
      // update the course record in the database with the new lecturer's ID
      const course = await prisma.course.update({
        where: { id: Number(courseId) },
        data: { lecturerId: lecturerId ? Number(lecturerId) : null },
      });
      // record that an admin just assigned a lecturer for our audit logs
      await logActivity({
        userId: Number(userObj.id),
        action: 'COURSE_LECTURER_ASSIGN',
        level: 'INFO',
        meta: { courseId, lecturerId },
      });
      // send a success message back with the updated course data
      return NextResponse.json({ success: true, message: 'Lecturer assigned to course successfully.', course });
    }

    // if the admin wants to enroll a student in a course
    if (action === 'ENROLL_STUDENT') {
      // if the student ID is missing, stop and tell them it's required
      if (!studentId) {
        return NextResponse.json({ success: false, message: 'Student ID is required.' }, { status: 400 });
      }

      // add the student to the course or update their status if they were already there
      const enrollment = await prisma.courseEnrollment.upsert({
        where: {
          courseId_studentId: {
            courseId: Number(courseId),
            studentId: Number(studentId),
          },
        },
        update: { status: 'ENROLLED' },
        create: {
          courseId: Number(courseId),
          studentId: Number(studentId),
          status: 'ENROLLED',
        },
      });

      // record that an admin just enrolled a student for our audit logs
      await logActivity({
        userId: Number(userObj.id),
        action: 'COURSE_STUDENT_ENROLL',
        level: 'INFO',
        meta: { courseId, studentId },
      });

      // send a success message back with the enrollment data
      return NextResponse.json({ success: true, message: 'Student enrolled into course successfully.', enrollment });
    }

    // if a command we don't recognize was sent, tell them it's invalid
    return NextResponse.json({ success: false, message: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Course Action API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
