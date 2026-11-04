// Input Component: A styled text field for users to type information into
// Imports React to build the component
import React from 'react';
// Imports the style combiner tool
import { cn } from '@/lib/utils';

// Defines the extra features this input field can have
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // An optional title text above the input box
  label?: string;
  // An optional error message to show below the input box
  error?: string;
}

// Creates the Input component and allows it to be focused by other parts of the app
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // Takes in settings like label, error, and type (e.g., password or email)
  ({ className, label, error, type, ...props }, ref) => {
    // Returns a container for the label, input, and error message
    return (
      <div className="w-full">
        {/* If a label was provided, show it as small gray text */}
        {label && (
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        {/* The actual box where the user types */}
        <input
          // Sets whether this is text, a password, etc.
          type={type}
          // Combines the base appearance (dark background, blue focus ring) with error styles if needed
          className={cn(
            'flex h-10 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            // If there is an error, make the border red
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            // Adds any extra styles passed from the outside
            className
          )}
          // Connects the input to a "ref" so it can be controlled programmatically
          ref={ref}
          // Applies all other standard input settings
          {...props}
        />
        {/* If an error message exists, show it in red text below the box */}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
// Sets a friendly name for this component for debugging purposes
Input.displayName = 'Input';
