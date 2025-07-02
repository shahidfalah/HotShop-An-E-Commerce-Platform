// src/app/not-found.tsx
import Link from 'next/link';
import React from 'react';

// This component will be rendered when a route is not found.
// It should be a client component if it uses hooks like `useRouter` or `useState`,
// but for a simple static 404 page, a Server Component is fine and more performant.
// We'll keep it simple as a Server Component for better performance.

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 text-center bg-white text-(--color-font)">
      {/* min-h-[calc(100vh-64px)] assumes your header has a height of 64px (h-16 in mobile nav).
        Adjust this value if your header's height is different, or remove it if you
        want the 404 page to take up the full viewport height regardless of header.
      */}
      <h1 className="text-9xl font-extrabold text-(--color-primary) mb-4 animate-bounce">
        404
      </h1>
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
      </p>
      <Link href="/">
        <button className="px-8 py-3 rounded-lg font-semibold bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors duration-300 shadow-lg">
          Go to Homepage
        </button>
      </Link>
    </div>
  );
}
