// src/app/error.tsx
"use client"; // Error boundaries must be client components

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react'; // Example icon

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void; // Function to retry rendering the segment
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry or Datadog
    console.error('Caught an error in error.tsx:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 text-center bg-white text-(--color-font)">
      <TriangleAlert className="w-16 h-16 text-(--color-error) mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Something Went Wrong!
      </h2>
      <p className="text-md text-gray-600 mb-6 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      {/* Optional: Display error details in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-left whitespace-pre-wrap max-w-lg mb-6">
          <code>{error.message}</code>
        </pre>
      )}
      <button
        className="px-8 py-3 rounded-lg font-semibold bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors duration-300 shadow-lg"
        onClick={
          // Attempt to re-render the segment by calling the reset function
          () => reset()
        }
      >
        Try Again
      </button>
    </div>
  );
}