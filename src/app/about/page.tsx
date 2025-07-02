// src/app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react'; // Importing a friendly icon

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-(--color-font) min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <Sparkles className="w-20 h-20 text-(--color-primary) mb-6 animate-pulse" /> {/* Added icon */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Hello from HotShop!</h1>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed text-center max-w-2xl">
        Hey there! We&apos;re HotShop, and we&apos;re super excited you stopped by. This project is a passion
        of ours, built to explore the world of e-commerce and bring you a neat little online store experience.
      </p>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed text-center max-w-2xl">
        Think of HotShop as a friendly corner of the internet where you can browse some cool items.
        We&apos;re constantly learning and tweaking things to make your visit here as smooth and enjoyable as possible.
      </p>
      <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center max-w-2xl">
        This whole project is a work in progress, and we&apos;re always looking for ways to improve.
        Thanks for being here and checking out what we&apos;ve built!
      </p>
      <Link href="/contact">
        <button className="px-8 py-3 rounded-lg font-semibold bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors duration-300 shadow-lg">
          Say Hi!
        </button>
      </Link>
    </div>
  );
}
