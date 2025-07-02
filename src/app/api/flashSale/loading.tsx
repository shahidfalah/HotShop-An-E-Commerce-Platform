// src/app/loading.tsx
import React from 'react';
import { PackageSearch } from 'lucide-react'; // Example icon

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 text-center bg-white text-(--color-font)">
      <PackageSearch className="w-16 h-16 text-(--color-primary) mb-4 animate-spin-slow" /> {/* Example spinning icon */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Loading...
      </h2>
      <p className="text-md text-gray-600">
        Please wait while we fetch the content.
      </p>
    </div>
  );
}