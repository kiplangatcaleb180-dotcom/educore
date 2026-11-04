// Card Component: A container that looks like a box to group related information
// Imports React to build the component
import React from 'react';
// Imports the style combiner tool
import { cn } from '@/lib/utils';

// Defines the Card component as a container for other elements
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  // Allows adding extra custom styles from outside
  className,
  // The content that will be placed inside the card
  children,
  // Collects any other standard container settings
  ...props
}) => {
  // Returns a div element that looks like a translucent box
  return (
    <div
      // Sets the card's look: dark background, blurry effect, and a subtle border that changes on hover
      className={cn(
        'bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-md transition-all hover:border-slate-700',
        className
      )}
      // Applies all other standard settings
      {...props}
    >
      {/* Places the content inside the box */}
      {children}
    </div>
  );
};
