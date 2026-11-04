/**
 * Module Title: User Administration API
 * Purpose: This file allows administrators to manage user accounts, including
 * approving registrations, blocking users, changing roles, and updating department assignments.
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

// PATCH: Handle various administrative actions on user accounts
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
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    // extract the user ID and the action to perform from the request data
    const { userId, action, newRole, isBlocked, isActive, departmentId } = await req.json();

    // if the target user's ID is missing, stop and tell them it's required
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    // find the user we want to update in the database
    const targetUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    // if the user doesn't exist, stop and tell them we couldn't find them
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found.' }, { status: 404 });
    }

    // a placeholder to store the user's data after we update it
    let updatedUser;

    // determine what kind of update the administrator wants to perform
    switch (action) {
      case 'APPROVE':
        // mark the user as approved and active, and remove any blocks
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            pendingApproval: false,
            isActive: true,
            isBlocked: false,
          },
        });
        // record that an admin approved this user for our security logs
        await logActivity({
          userId: Number(userObj.id),
          action: 'USER_APPROVE',
          level: 'INFO',
          meta: { targetUserId: userId, email: targetUser.email },
        });
        break;

      case 'DECLINE':
        // mark the user as no longer pending, but keep them inactive and blocked
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            pendingApproval: false,
            isActive: false,
            isBlocked: true,
          },
        });
        // record that an admin declined this user for our security logs
        await logActivity({
          userId: Number(userObj.id),
          action: 'USER_DECLINE',
          level: 'WARNING',
          meta: { targetUserId: userId, email: targetUser.email },
        });
        break;

      case 'TOGGLE_BLOCK':
        // flip the user's "blocked" status or set it to a specific value
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            isBlocked: typeof isBlocked === 'boolean' ? isBlocked : !targetUser.isBlocked,
          },
        });
        // record whether the user was just blocked or unblocked
        await logActivity({
          userId: Number(userObj.id),
          action: updatedUser.isBlocked ? 'USER_BLOCK' : 'USER_UNBLOCK',
          level: updatedUser.isBlocked ? 'WARNING' : 'INFO',
          meta: { targetUserId: userId },
        });
        break;

      case 'CHANGE_ROLE':
        // check if a new role was actually provided
        if (!newRole) {
          return NextResponse.json({ success: false, message: 'New role is required.' }, { status: 400 });
        }
        // update the user's role (e.g., from STUDENT to LECTURER)
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            role: newRole,
          },
        });
        // record that the user's role was changed for our security logs
        await logActivity({
          userId: Number(userObj.id),
          action: 'USER_ROLE_CHANGE',
          level: 'INFO',
          meta: { targetUserId: userId, oldRole: targetUser.role, newRole },
        });
        break;

      case 'TOGGLE_ACTIVE':
        // flip the user's "active" status or set it to a specific value
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            isActive: typeof isActive === 'boolean' ? isActive : !targetUser.isActive,
          },
        });
        // record whether the user was just activated or deactivated
        await logActivity({
          userId: Number(userObj.id),
          action: updatedUser.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
          level: 'INFO',
          meta: { targetUserId: userId },
        });
        break;

      case 'UPDATE_DEPARTMENT':
        // assign the user to a specific department or clear their assignment
        updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            departmentId: departmentId ? Number(departmentId) : null,
          },
        });
        // record that the user's department was updated
        await logActivity({
          userId: Number(userObj.id),
          action: 'USER_DEPARTMENT_UPDATE',
          level: 'INFO',
          meta: { targetUserId: userId, departmentId },
        });
        break;

      default:
        // if an action was requested that we don't handle, tell them it's invalid
        return NextResponse.json({ success: false, message: 'Invalid action provided.' }, { status: 400 });
    }

    // send a success message back along with the updated user data
    return NextResponse.json({
      success: true,
      message: 'User account updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    // if something unexpected goes wrong, log the error for developers to fix
    console.error('Admin User Action Error:', error);
    // tell the user that there was a problem on the server side
    return NextResponse.json(
      { success: false, message: 'Internal server error processing user action.' },
      { status: 500 }
    );
  }
}
