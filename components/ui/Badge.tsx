// Badge Component: A small colorful tag used to show status or categories
// Imports React to build the component
import React from 'react';
// Imports the style combiner tool
import { cn } from '@/lib/utils';

// Defines the properties for the Badge, including its color style
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // The color theme: green for success, red for danger, etc.
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

// The main Badge component
export const Badge: React.FC<BadgeProps> = ({
  // Sets 'info' (blue) as the default color if none is chosen
  variant = 'info',
  // Allows adding extra custom styles
  className,
  // The text or icon inside the badge
  children,
  // Collects other standard settings
  ...props
}) => {
  // A dictionary mapping each variant name to specific CSS colors
  const variants = {
    // Green style for positive status
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    // Yellow style for warnings
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    // Red style for errors or alerts
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    // Blue style for general information
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    // Gray style for less prominent tags
    secondary: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  // Returns a small pill-shaped span element
  return (
    <span
      // Sets the base layout: small text, rounded corners, and capitalized letters
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize',
        // Adds the specific colors for the chosen variant
        variants[variant],
        // Adds any extra custom styles
        className
      )}
      // Applies other standard settings
      {...props}
    >
      {/* Places the content inside the badge */}
      {children}
    </span>
  );
};
