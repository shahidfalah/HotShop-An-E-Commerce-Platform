"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/_components/ui/button"
import categoriesData from "../data/categories.json"

export default function BrowseByCategory() {
  const [activeCategory, setActiveCategory] = useState(1)

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("categories-container")
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-5 h-10 bg-red-500 rounded"></div>
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
          <div
            id="categories-container"
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoriesData.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-none w-32 h-32 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                  activeCategory === category.id
                    ? "border-red-500 bg-red-500 text-white shadow-lg"
                    : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
