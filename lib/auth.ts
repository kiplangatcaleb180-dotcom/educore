/**
 * MODULE: Authentication Configuration
 * This file sets up how users log in and how the app remembers them.
 */

// Imports authentication tools to handle login securely
import { NextAuthOptions } from 'next-auth';
// Imports the username/password login method
import CredentialsProvider from 'next-auth/providers/credentials';
// Imports a security tool to compare scrambled passwords safely
import bcrypt from 'bcryptjs';
// Imports the database connection to look up users in the database
import prisma from '@/lib/prisma';
// Imports the activity logger to record when users sign in or out
import { logActivity } from './logger';

// Starts the authentication settings for NextAuth
export const authOptions: NextAuthOptions = {
  // Defines how sessions work to keep users logged in
  session: {
    // Uses a secure token strategy (efficient and safe)
    strategy: 'jwt',
    // Sets the login duration to 30 days
    maxAge: 30 * 24 * 60 * 60,
  },
  // Sets custom pages for specific login screen
  pages: {
    // Points to the login page
    signIn: '/login',
    // Points to the login page for errors
    error: '/login',
  },
  // Defines login methods (email/password method)
  providers: [
    // Sets up the email and password provider
    CredentialsProvider({
      // Names this method for identification in the system
      name: 'Credentials',
      // Describes required inputs (email and password)
      credentials: {
        // Sets up the email field
        email: { label: 'Email', type: 'email' },
        // Sets up the password field
        password: { label: 'Password', type: 'password' },
      },
      // Checks if the login is valid
      async authorize(credentials) {
        // Checks if both fields are filled
        if (!credentials?.email || !credentials?.password) {
          // Stops the process if fields are missing
          throw new Error('Please enter both email and password.');
        }

        // Looks for the user in the database by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        // Checks if the user was found
        if (!user) {
          // Stops the process if email isn't in system
          throw new Error('No user found with this email.');
        }

        // Checks if the user is blocked
        if (user.isBlocked) {
          // Stops the process if account is suspended
          throw new Error('Your account has been blocked. Please contact support.');
        }

        // Checks if the account is approved
        if (user.pendingApproval) {
          // Stops the process if admin hasn't reviewed account
          throw new Error('Your account is pending administrator approval.');
        }

        // Checks if the account is active
        if (!user.isActive) {
          // Stops the process if account is currently turned off
          throw new Error('Your account is currently inactive.');
        }

        // Compares the provided password with the stored one
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        // Verifies the password matches
        if (!isPasswordValid) {
          // Stops the process if password was wrong
          throw new Error('Invalid email or password.');
        }

        // Returns user details for the application session
        return {
          id: String(user.id),
          name: `${user.firstName} ${user.surname}`,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          departmentId: user.departmentId,
          studentId: user.studentId,
        };
      },
    }),
  ],
  // Defines special functions to pass data between server and browser
  callbacks: {
    // Handles the security token (JWT)
    async jwt({ token, user, trigger, session }) {
      // Saves user info into the token on initial login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.departmentId = (user as any).departmentId;
        token.studentId = (user as any).studentId;
      }

      // Handles updates from the client (e.g. profile changes)
      if (trigger === 'update' && session) {
        if (session.departmentId) token.departmentId = session.departmentId;
        if (session.studentId) token.studentId = session.studentId;
      }

      return token;
    },
    // Handles the user session to make info available to the client
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).departmentId = token.departmentId;
        (session.user as any).studentId = token.studentId;
      }
      return session;
    },
  },
  // Defines events to log specific actions
  events: {
    // Records when a user signs in
    async signIn({ user }) {
      await logActivity({
        userId: Number(user.id),
        action: 'USER_LOGIN',
        level: 'INFO',
        meta: { email: user.email },
      });
    },
    // Records when a user signs out
    async signOut({ token }) {
      if (token?.id) {
        await logActivity({
          userId: Number(token.id),
          action: 'USER_LOGOUT',
          level: 'INFO',
        });
      }
    },
  },
  // Sets a secret key to keep login tokens safe
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',
};
