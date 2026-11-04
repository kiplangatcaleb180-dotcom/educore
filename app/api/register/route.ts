/**
 * Module Title: User Registration API
 * Purpose: This file handles the process of new users signing up for an account.
 * It saves their details and puts them in a "pending approval" state for administrators to review.
 */

// import standard tools for sending web responses
import { NextResponse } from 'next/server';
// import a tool to securely scramble passwords so they aren't stored in plain text
import bcrypt from 'bcryptjs';
// import the database connection tool to save and retrieve data
import prisma from '@/lib/prisma';
// import a tool to record what actions users perform for security tracking
import { logActivity } from '@/lib/logger';

// POST: Handle new user registration requests
export async function POST(req: Request) {
  try {
    // extract the user's registration details from the web form data
    const { firstName, surname, email, password, role, idNumber } = await req.json();

    // if any of the required fields are missing, stop and tell them to fill them in
    if (!firstName || !surname || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided.' },
        { status: 400 }
      );
    }

    // remove extra spaces and make the email lowercase for consistent storage
    const normalizedEmail = email.trim().toLowerCase();

    // check if someone has already registered with this email address
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // if the email is already in use, stop and tell them they can't register again
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // scramble the password with a security key so it's safe in the database
    const passwordHash = await bcrypt.hash(password, 10);
    // decide if the user is a Lecturer or a Student based on their choice
    const userRole = role === 'LECTURER' ? 'LECTURER' : 'STUDENT';

    // create the new user record in the database with all their information
    const user = await prisma.user.create({
      data: {
        firstName,
        surname,
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        // assign a student ID or a staff ID based on their role
        studentId: userRole === 'STUDENT' ? idNumber || `STU-${Date.now()}` : null,
        staffId: userRole === 'LECTURER' ? idNumber || `LEC-${Date.now()}` : null,
        // set the account to "pending" so an admin has to approve it first
        pendingApproval: true,
        isActive: false,
      },
    });

    // record that a new user just registered for our security logs
    await logActivity({
      userId: user.id,
      action: 'USER_REGISTER',
      level: 'INFO',
      meta: { role: userRole, email: normalizedEmail },
    });

    // tell the user their account was created and is waiting for approval
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Pending admin approval.',
    });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Registration API error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json(
      { success: false, message: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
