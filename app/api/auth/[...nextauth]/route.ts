/**
 * Module Title: Authentication Route Handler
 * Purpose: This file acts as the gateway for all authentication requests (like logging in and out)
 * using the NextAuth library.
 */

// import the main NextAuth tool for handling logins
import NextAuth from 'next-auth';
// import the specific settings and rules we defined for our app's security
import { authOptions } from '@/lib/auth';

// create a handler that will manage both GET and POST requests for authentication
const handler = NextAuth(authOptions);

// export the handler so the system can use it to log people in and out
export { handler as GET, handler as POST };
