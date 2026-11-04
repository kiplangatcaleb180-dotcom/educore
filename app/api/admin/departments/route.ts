/**
 * Module Title: Department Management API
 * Purpose: This file allows administrators to view, create, update, and delete
 * university departments within the system.
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

// GET: Retrieve all departments from the system
export async function GET(req: Request) {
  try {
    // get information about the person making the request to see if they are logged in
    const session = await getServerSession(authOptions);
    // if the person is not logged in, stop and tell them they are unauthorized
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // fetch a list of all departments from the database
    const departments = await prisma.department.findMany({
      // include details about the faculty it belongs to and the head of department
      include: {
        faculty: true,
        head: true,
        // also count how many courses and users are in each department
        _count: { select: { courses: true, users: true } },
      },
      // sort the list by name in alphabetical order
      orderBy: { name: 'asc' },
    });

    // send the list of departments back to the web browser
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Fetch Departments API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// POST: Create a new department
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

    // extract the department details (like name and code) sent from the web form
    const { name, code, description, facultyId, headId } = await req.json();

    // if the name or code is missing, stop and tell them it's required
    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Department Name and Code are required.' }, { status: 400 });
    }

    // check the database to see if a department with this name or code already exists
    const existingDept = await prisma.department.findFirst({
      where: { OR: [{ name: name.trim() }, { code: code.trim().toUpperCase() }] },
    });

    // if it already exists, stop and tell them they can't create it again
    if (existingDept) {
      return NextResponse.json({ success: false, message: 'A department with this name or code already exists.' }, { status: 400 });
    }

    // create the new department record in the database
    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description || null,
        facultyId: facultyId ? Number(facultyId) : null,
        headId: headId ? Number(headId) : null,
      },
    });

    // record that an admin just created a new department for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'DEPARTMENT_CREATE',
      level: 'INFO',
      meta: { departmentId: department.id, name: department.name, code: department.code },
    });

    // send a success message back along with the new department data
    return NextResponse.json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Create Department API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH: Update an existing department's information
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
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // extract the ID and the new information for the department
    const { id, name, code, description, facultyId, headId } = await req.json();

    // if the department ID is missing, stop and tell them it's required
    if (!id) {
      return NextResponse.json({ success: false, message: 'Department ID is required' }, { status: 400 });
    }

    // check if the new name or code is already used by another department
    if (name || code) {
      const conflict = await prisma.department.findFirst({
        where: {
          OR: [
            name ? { name: name.trim() } : {},
            code ? { code: code.trim().toUpperCase() } : {}
          ].filter(Boolean) as any,
          // make sure we aren't comparing the department against itself
          NOT: { id: Number(id) }
        }
      });

      // if there's a conflict, tell them they can't use that name or code
      if (conflict) {
        return NextResponse.json({
          success: false,
          message: 'Another department already uses this name or code.'
        }, { status: 400 });
      }
    }

    // update the department record in the database with the new details
    const department = await prisma.department.update({
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        code: code?.trim().toUpperCase(),
        description: description,
        facultyId: facultyId ? Number(facultyId) : null,
        headId: headId ? Number(headId) : null,
      },
    });

    // record that an admin updated a department for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'DEPARTMENT_UPDATE',
      level: 'INFO',
      meta: { departmentId: department.id, name: department.name },
    });

    // send a success message back along with the updated department data
    return NextResponse.json({ success: true, message: 'Department updated successfully', department });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Update Department Error:', error);
    // if the database reports that a unique name or code was duplicated
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Unique constraint failed: Name or Code already exists.' }, { status: 400 });
    }
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a department from the system
export async function DELETE(req: Request) {
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
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // get the department ID from the web address (URL)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // if the ID is missing, stop and tell them it's required
    if (!id) {
      return NextResponse.json({ success: false, message: 'Department ID is required' }, { status: 400 });
    }

    // delete the department record from the database
    await prisma.department.delete({
      where: { id: Number(id) },
    });

    // record that an admin deleted a department for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'DEPARTMENT_DELETE',
      level: 'WARNING',
      meta: { departmentId: id },
    });

    // send a success message back to the web browser
    return NextResponse.json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Delete Department Error:', error);
    // if we can't delete it because it still has courses or users connected to it
    if (error.code === 'P2003') {
      return NextResponse.json({ success: false, message: 'Cannot delete department with existing courses or users' }, { status: 400 });
    }
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
