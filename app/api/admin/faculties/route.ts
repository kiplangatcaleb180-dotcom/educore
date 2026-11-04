/**
 * Module Title: Faculty Management API
 * Purpose: This file provides the backend functionality for administrators to list,
 * create, update, and delete university faculties.
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

// GET: Retrieve all faculties from the system
export async function GET(req: Request) {
  try {
    // get information about the person making the request to see if they are logged in
    const session = await getServerSession(authOptions);
    // if the person is not logged in, stop and tell them they are unauthorized
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // fetch a list of all faculties from the database
    const faculties = await prisma.faculty.findMany({
      // include the count of how many departments belong to each faculty and the name of the dean
      include: {
        _count: { select: { departments: true } },
        dean: true,
      },
      // sort the list by name in alphabetical order
      orderBy: { name: 'asc' },
    });

    // send the list of faculties back to the web browser
    return NextResponse.json({ success: true, faculties });
  } catch (error) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Fetch Faculties API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// POST: Create a new faculty
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

    // extract the faculty details (like name and code) sent from the web form
    const { name, code, description, deanId } = await req.json();

    // if the name or code is missing, stop and tell them it's required
    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Faculty Name and Code are required.' }, { status: 400 });
    }

    // check the database to see if a faculty with this name or code already exists
    const existingFaculty = await prisma.faculty.findFirst({
      where: { OR: [{ name: name.trim() }, { code: code.trim().toUpperCase() }] },
    });

    // if it already exists, stop and tell them they can't create it again
    if (existingFaculty) {
      return NextResponse.json({ success: false, message: 'A faculty with this name or code already exists.' }, { status: 400 });
    }

    // create the new faculty record in the database
    const faculty = await prisma.faculty.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description || null,
        deanId: deanId ? Number(deanId) : null,
      },
    });

    // record that an admin just created a new faculty for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'FACULTY_CREATE',
      level: 'INFO',
      meta: { facultyId: faculty.id, name: faculty.name, code: faculty.code },
    });

    // send a success message back along with the new faculty data
    return NextResponse.json({
      success: true,
      message: 'Faculty created successfully.',
      faculty,
    });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Create Faculty API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH: Update an existing faculty's information
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

    // extract the ID and the new information for the faculty
    const { id, name, code, description, deanId } = await req.json();

    // if the faculty ID is missing, stop and tell them it's required
    if (!id) {
      return NextResponse.json({ success: false, message: 'Faculty ID is required' }, { status: 400 });
    }

    // check if the new name or code is already used by another faculty
    if (name || code) {
      const conflict = await prisma.faculty.findFirst({
        where: {
          OR: [
            name ? { name: name.trim() } : {},
            code ? { code: code.trim().toUpperCase() } : {}
          ].filter(Boolean) as any,
          // make sure we aren't comparing the faculty against itself
          NOT: { id: Number(id) }
        }
      });

      // if there's a conflict, tell them they can't use that name or code
      if (conflict) {
        return NextResponse.json({
          success: false,
          message: 'Another faculty already uses this name or code.'
        }, { status: 400 });
      }
    }

    // update the faculty record in the database with the new details
    const faculty = await prisma.faculty.update({
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        code: code?.trim().toUpperCase(),
        description: description,
        deanId: deanId ? Number(deanId) : null,
      },
    });

    // record that an admin updated a faculty for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'FACULTY_UPDATE',
      level: 'INFO',
      meta: { facultyId: faculty.id, name: faculty.name },
    });

    // send a success message back along with the updated faculty data
    return NextResponse.json({ success: true, message: 'Faculty updated successfully', faculty });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Update Faculty Error:', error);
    // if the database reports that a unique name or code was duplicated
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Unique constraint failed: Name or Code already exists.' }, { status: 400 });
    }
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a faculty from the system
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

    // get the faculty ID from the web address (URL)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // if the ID is missing, stop and tell them it's required
    if (!id) {
      return NextResponse.json({ success: false, message: 'Faculty ID is required' }, { status: 400 });
    }

    // delete the faculty record from the database
    await prisma.faculty.delete({
      where: { id: Number(id) },
    });

    // record that an admin deleted a faculty for our audit logs
    await logActivity({
      userId: Number(userObj.id),
      action: 'FACULTY_DELETE',
      level: 'WARNING',
      meta: { facultyId: id },
    });

    // send a success message back to the web browser
    return NextResponse.json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Delete Faculty Error:', error);
    // if we can't delete it because it still has departments connected to it
    if (error.code === 'P2003') {
      return NextResponse.json({ success: false, message: 'Cannot delete faculty with existing departments' }, { status: 400 });
    }
    // tell the user that there was a problem on the server side
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
