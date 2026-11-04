// Button Component: A reusable button that can change its look and size
// This imports the React library to help build the user interface
import React from 'react';
// This imports a helper tool to combine CSS style names efficiently
import { cn } from '@/lib/utils';

// This defines what information the Button needs to work properly
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // This allows choosing a specific color style for the button
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  // This allows choosing how big or small the button should be
  size?: 'sm' | 'md' | 'lg';
  // This represents the text or elements that will appear inside the button
  children: React.ReactNode;
}

// This is the main Button component that others will use
export const Button: React.FC<ButtonProps> = ({
  // Sets the default style to 'primary' if none is provided
  variant = 'primary',
  // Sets the default size to 'md' (medium) if none is provided
  size = 'md',
  // Allows adding extra custom styles from outside
  className,
  // The content inside the button
  children,
  // Collects any other standard button settings like 'onClick'
  ...props
}) => {
  // These are the base styles every button starts with, like rounded corners and fonts
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // This list defines the different color themes for the button
  const variants = {
    // The main blue gradient style
    primary: 'bg-gradient-to-r from-sky-500 to-sky-400 text-white hover:opacity-95 shadow-lg shadow-sky-500/20 active:scale-[0.98]',
    // A dark slate style for less important actions
    secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 active:scale-[0.98]',
    // A clear style with just a blue border
    outline: 'bg-transparent border border-sky-400 text-sky-400 hover:bg-sky-500/10 active:scale-[0.98]',
    // A red gradient style for dangerous actions like deleting
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-95 shadow-lg shadow-red-500/20 active:scale-[0.98]',
    // A subtle style that only shows a background when you hover over it
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50',
  };

  // This list defines how much padding and text size each size option has
  const sizes = {
    // Small size
    sm: 'px-3 py-1.5 text-xs',
    // Medium size
    md: 'px-4 py-2 text-sm',
    // Large size
    lg: 'px-6 py-3 text-base',
  };

  // This returns the actual HTML button element to the screen
  return (
    <button
      // Combines all the styles together based on the chosen options
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      // Applies all the other standard button settings
      {...props}
    >
      {/* Places the text or icons inside the button */}
      {children}
    </button>
  );
};
