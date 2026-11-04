/**
 * MODULE: Activity Logger
 * This file provides a way to record user actions for security and auditing.
 */

// Imports the database connection to save logs
import prisma from './prisma';
// Imports log levels to categorize log importance
import { LogLevel } from '@prisma/client';

// Defines the structure of log information
interface LogOptions {
  // User ID associated with the action
  userId?: number | null;
  // Description of the action taken
  action: string;
  // Importance level of the log
  level?: LogLevel;
  // User's IP address
  ip?: string;
  // User's device information
  userAgent?: string;
  // Additional details for the action
  meta?: any;
}

// Function to save an activity log to the database
export async function logActivity({
  userId,
  action,
  level = 'INFO',
  ip,
  userAgent,
  meta,
}: LogOptions) {
  try {
    // Sends the log data to the database
    await prisma.log.create({
      data: {
        userId,
        action,
        level,
        ip,
        userAgent,
        // Ensures meta data is in a serializable format
        meta: meta ? JSON.parse(JSON.stringify(meta)) : undefined,
      },
    });
  } catch (error) {
    // Prints an error to the console if logging fails
    console.error('CRITICAL: Failed to write audit log:', error);
  }
}
