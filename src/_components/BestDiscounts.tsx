// src/_components/FlashSales.tsx
"use client"; // This component remains a Client Component for scrolling interactivity

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import ProductCard from "./ProductCard";
import { Button } from "@/_components/ui/button";
import Link from "next/link";

// Define the interface for the product data expected from the API
interface ProductCounts {
  reviews: number;
  wishlists: number;
}

export interface Product { // Export Product interface as it will be used by parent component
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleStart: string | null;
  saleEnd: string | null;
  isFlashSale: boolean;
  images: string[];
  brand: string | null;
  width: number | null;
  height: number | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  categoryId: string;
  timeLeftMs: number | null;
  rating: number | null;
  _count: ProductCounts;
}

export default function BestDiscounts({ initialProducts }: { initialProducts: Product[] }) {
  const [ products ] = useState<Product[]>(initialProducts);

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("best-discounts-container");
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // If initialProducts can be empty and you want to show a message
  const hasProducts = products && products.length > 0;

  return (
    <section className="py-12 bg-white px-[16px] md:px-[88px]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 px-4">
            <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
              <Tag className="w-6 h-6 text-(--color-background)" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Best Discounts</h2>
            </div>
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

        {/* Products Carousel */}
        <div className="relative">
          {!hasProducts ? (
            <p className="text-center text-gray-500 py-8">No products with significant discounts found.</p>
          ) : (
            <div
              id="best-discounts-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product) => {
                if(!(product.saleStart && product.saleEnd && new Date(product.saleEnd) < new Date())){
                  return (<div key={product.id} className="flex-none w-72 md:w-80">
                    <ProductCard product={product} showTimer={false} />
                  </div>)
                }
              })}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link href="/products">
            <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-8 py-3" size="lg">
              View All Discounts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
