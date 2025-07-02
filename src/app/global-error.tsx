// src/app/global-error.tsx
"use client"; // Global error boundaries must also be client components

import React, { useEffect } from 'react';
import { CircleX } from 'lucide-react'; // Example icon

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Caught a global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 text-center bg-white text-(--color-font)">
          <CircleX className="w-20 h-20 text-(--color-error) mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Critical Application Error
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-md">
            We apologize, but a critical error has occurred that prevents the page from loading.
            Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="bg-gray-100 p-4 rounded-lg text-sm text-left whitespace-pre-wrap max-w-lg mb-6">
              <code>{error.message}</code>
            </pre>
          )}
          <button
            className="px-8 py-3 rounded-lg font-semibold bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors duration-300 shadow-lg"
            onClick={
              () => reset() // Attempt to reload the page or navigate to home
            }
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}