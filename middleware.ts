/**
 * MODULE: Route Guard & Security Middleware
 * Acts as a security gatekeeper for application routes.
 */

// Imports tools for authentication token retrieval and response handling
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Main security check function executed before each page load
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev' });

  // Categorize the requested path
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPath = pathname.startsWith('/admin');
  const isLecturerPath = pathname.startsWith('/lecturer');
  const isStudentPath = pathname.startsWith('/student');

  // Handle authenticated users visiting auth pages
  if (isAuthPage && token) {
    const role = (token.role as string)?.toLowerCase();
    if (role === 'admin' || role === 'superadmin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else if (role === 'lecturer') {
      return NextResponse.redirect(new URL('/lecturer', req.url));
    } else {
      return NextResponse.redirect(new URL('/student', req.url));
    }
  }

  // Protect Admin area
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
    }
    const role = (token.role as string)?.toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect Lecturer area
  if (isLecturerPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
    }
    const role = (token.role as string)?.toUpperCase();
    if (role !== 'LECTURER' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect Student area
  if (isStudentPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
    }
    const role = (token.role as string)?.toUpperCase();
    if (role !== 'STUDENT' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Ensure students complete profile setup
    if (role === 'STUDENT' && !(token as any).departmentId && !pathname.includes('/student/setup')) {
      return NextResponse.redirect(new URL('/student/setup', req.url));
    }
  }

  return NextResponse.next();
}

// Configures which paths the middleware applies to
export const config = {
  matcher: ['/admin/:path*', '/lecturer/:path*', '/student/:path*', '/login', '/register'],
};
