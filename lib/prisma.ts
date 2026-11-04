/**
 * MODULE: Database Connection Management
 * This file creates and manages the connection to our database.
 */

// Imports the database client tool to interact with the database
import { PrismaClient } from '@prisma/client';

// Creates a global variable to reuse the same connection and save resources
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Sets up the database connection, reusing an existing one if available
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Sets logging levels for development and production
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Saves the connection globally in development to prevent excessive connections
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Exports the connection for use in other parts of the app
export default prisma;
