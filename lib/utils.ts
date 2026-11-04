/**
 * MODULE: General Utility Functions
 * This file contains helper tools for formatting and styling.
 */

// Imports tools for managing and merging CSS classes
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combines style names using tailwind-merge and clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a date into a readable short format (e.g., "Sep 9, 2026")
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Formats a date and time into a readable format
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
