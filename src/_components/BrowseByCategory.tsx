// src/_components/BrowseByCategory.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";
import * as LucideIcons from "lucide-react"; // Import all Lucide icons
import { type LucideProps } from "lucide-react"; // Import LucideProps for typing
import { Button } from "@/_components/ui/button";
import Link from "next/link";

// Define the Category interface (consistent with your API response)
export interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string;
}

export default function BrowseByCategory({ initialCategories }: { initialCategories: Category[] }) {
  const [categories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategories.length > 0 && activeCategory === null) {
      setActiveCategory(initialCategories[0].id);
    }
  }, [initialCategories, activeCategory]);

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("categories-container");
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="categories" className="py-12 bg-white px-[16px] md:px-[88px]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-(--color-background)" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse By Category</h2>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollContainer("left")}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollContainer("right")}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="relative">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No categories found.</p>
          ) : (
            <div
              id="categories-container"
              className="flex space-x-6 overflow-x-auto scrollbar-hide px-4 py-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => {
                // Dynamically get the Lucide icon component
                const IconComponent = category.icon
                  ? (LucideIcons[category.icon as keyof typeof LucideIcons] as React.ElementType<LucideProps>)
                  : null;

                return (
                  <Link href="/products" key={category.id}>
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex-none w-32 h-32 rounded-lg border-2 transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center space-y-2
                        ${activeCategory === category.id
                          ? "border-(--color-primary) bg-(--color-primary) text-white shadow-lg"
                          : "border-gray-200 bg-white text-gray-700 hover:border-(--color-primary) hover:text-(--color-primary)"
                        }`}
                    >
                      <span className="text-3xl">
                        {IconComponent ? (
                          <IconComponent size={36} />
                        ) : (
                          "📦"
                        )}
                      </span>
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
