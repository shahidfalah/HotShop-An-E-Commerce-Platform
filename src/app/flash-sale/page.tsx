// src/app/flash-sale/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "@/_components/ProductCard";
import { PackageSearch } from "lucide-react";
import * as LucideIcons from "lucide-react"; // Import all Lucide icons
import { type LucideProps } from "lucide-react"; // Import LucideProps for typing

interface Category {
  id: string;
  title: string;
  icon?: string;
  slug: string;
}

interface ProductCounts {
  reviews: number;
  wishlists: number;
}

// Ensure this matches the transformed product structure from the API
interface TransformedProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleStart: string | null; // ISO string
  saleEnd: string | null;   // ISO string
  isFlashSale: boolean;
  itemsSold: number | null;
  itemLimit: number | null;
  discountPercentage: number | null;
  images: string[];
  brand: string | null;
  width: string | null;
  height: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdById: string;
  categoryId: string;
  timeLeftMs: number | null;
  rating: number | null; // Explicitly add rating
  _count: ProductCounts;
}

export default function FlashSalePage() {
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories`);
      // console.log("Response:", res.json());
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
      console.log(result)
      if (result.success) {
        setCategories(result.category);
      } else {
        setError(result.error || "Unknown error fetching categories");
      }
    } catch (err: any) {
      
      console.error("Failed to fetch categories:", err);
      setError(err.message || "Failed to fetch categories");
    }
  }, []);

  // Renamed to be more descriptive of what it fetches
  const fetchProductsForFlashSalePage = useCallback(async (categoryId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${window.location.origin}/api/products`);
      url.searchParams.append("type", "flashSale"); // Request flash sale products
      if (categoryId) {
        url.searchParams.append("categoryId", categoryId);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch flash sale products");
      const result = await res.json();
      if (result.success) {
        // Filter out products where timeLeftMs is null or zero (already handled in API, but good for safety)
        setProducts(result.data.filter((p: TransformedProduct) => (p.timeLeftMs ?? 0) > 0));
      } else {
        setError(result.error || "Unknown error fetching products");
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProductsForFlashSalePage(); // Initial fetch
  }, [fetchCategories, fetchProductsForFlashSalePage]);

  const handleCategoryClick = (id: string | null) => {
    setActiveCategory(id);
    fetchProductsForFlashSalePage(id || undefined);
  };

  // Removed calculateAverageRating function here as it's now handled by the API transformation
  // The ProductCard will directly receive the 'rating' property from the API response.

  return (
    <section className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-4 px-4 mb-4 md:mb-8">
        <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
          <PackageSearch className="w-6 h-6 text-(--color-background)" />
        </div>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Flash Sales</h2>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex space-x-4 overflow-x-auto mb-6 pb-2 px-2 border-b">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`flex flex-col items-center px-3 py-2 rounded transition text-sm ${
            !activeCategory
              ? "text-(--color-primary) border-b-2 border-(--color-primary)"
              : "text-gray-500 hover:text-(--color-primary)"
          }`}
        >
          <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">📦</span>
          All
        </button>

        {categories.map((cat) => {
          // Dynamically get the icon component from LucideIcons based on the stored name
          // Dynamically get the icon component from LucideIcons based on the stored name
          const IconComponent = cat.icon
            ? (LucideIcons[cat.icon as keyof typeof LucideIcons] as React.ElementType<LucideProps>)
            : null;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex flex-col items-center px-3 py-2 rounded transition text-sm ${
                activeCategory === cat.id
                  ? "text-(--color-primary) border-b-2 border-(--color-primary)" // Use bracket notation for custom CSS properties in Tailwind
                  : "text-gray-500 hover:text-(--color-primary)"
              }`}
            >
              <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {IconComponent ? (
                  <IconComponent size={24} /> // Render the Lucide icon component, adjust size
                ) : (
                  "🛒" // Fallback emoji if no icon is set or recognized
                )}
              </span>
              {cat.title}
            </button>
          );
        })}
      </div>

      {loading && <p className="text-center text-gray-500">Loading flash sale products...</p>}
      {error && <p className="text-center text-(--color-error)">Error: {error}</p>}
      {!loading && products.length === 0 && !error && (
        <p className="text-center text-gray-500">No active flash sale products found.</p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="flex-none">
            <ProductCard
              product={{
                // Spread all properties, including the 'rating' that comes from API
                ...product,
              }}
              showTimer={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
}