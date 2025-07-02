/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/BestDiscounts.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react"; // Added Tag icon
import ProductCard from "./ProductCard";
import { Button } from "@/_components/ui/button";
import Link from "next/link";

// Define the interface for the product data expected from the API
interface ProductCounts {
  reviews: number;
  wishlists: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleStart: string | null;
  saleEnd: string | null;
  isFlashSale: boolean;
  itemsSold: number | null;
  itemLimit: number | null;
  discountPercentage: number | null; // Expecting this from the API now
  images: string[];
  brand: string | null;
  width: string | null;
  height: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  categoryId: string;
  timeLeftMs: number | null; // Still relevant if some discounted items are also flash sales
  rating: number | null;
  _count: ProductCounts;
}

export default function FlashSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestDiscountProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${window.location.origin}/api/products`);
      url.searchParams.append("type", "bestDiscounts"); // New type to request best discounts

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch best discount products");
      }
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error || "Unknown error fetching best discount products");
      }
    } catch (err: any) {
      console.error("Failed to fetch best discount products:", err);
      setError(err.message || "Failed to fetch best discount products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestDiscountProducts();
  }, [fetchBestDiscountProducts]);

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("best-discounts-container");
    if (container) {
      const scrollAmount = 300; // Adjust scroll amount as needed
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 bg-white px-[16px] md:px-[88px]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 px-4">
            <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
              {/* Changed icon to Tag for discounts */}
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
          {loading && (
            <p className="text-center text-gray-500 py-8">Loading best discounts...</p>
          )}
          {error && (
            <p className="text-center text-red-500 py-8">Error: {error}</p>
          )}
          {!loading && products.length === 0 && !error && (
            <p className="text-center text-gray-500 py-8">No products with significant discounts found.</p>
          )}
          
          <div
            id="best-discounts-container" // Changed ID
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-none w-72 md:w-80">
                {/* showTimer is false as these are not necessarily flash sales */}
                <ProductCard product={product} showTimer={false} /> 
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link href="/products?sort=discount&order=desc"> {/* Link to a page showing all discounted products */}
            <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-8 py-3" size="lg">
              View All Discounts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}