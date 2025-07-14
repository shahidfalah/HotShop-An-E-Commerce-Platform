// src/app/products/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // This is a Client Component as it uses useState, useEffect, useCallback

import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "@/_components/ProductCard";
import { PackageSearch } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { type LucideProps } from "lucide-react";

// Re-using the TransformedProduct interface for type consistency
// This interface should ideally be defined in a shared types file (e.g., src/types/product.ts)
// but for now, we'll define it here for clarity.
interface TransformedProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleStart: string | null; // Keep saleStart as it's from DB
  saleEnd: string | null;    // Keep saleEnd as it's from DB
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
  rating: number | null;
  _count: {
    reviews: number;
    wishlists: number;
  };
  // Removed: timeLeftMs?: number | null; // This is a derived property, not from DB
}

interface Category {
  id: string;
  title: string;
  icon?: string;
  slug: string;
}

export default function ProductsPage() { // Renamed to ProductsPage
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches categories for filtering.
   */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
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
  
  /**
   * Fetches all active products, optionally filtered by category.
   * This is for the main /products page.
   */
  const fetchAllProducts = useCallback(async (categoryId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${window.location.origin}/api/products`);
      if (categoryId) {
        url.searchParams.append("categoryId", categoryId);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
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

  // Initial data fetch on component mount
  useEffect(() => {
    fetchCategories();
    fetchAllProducts(); // Initial fetch of all products
  }, [fetchCategories, fetchAllProducts]);

  /**
   * Handles category filter clicks.
   * @param id The ID of the clicked category, or null for "All".
   */
  const handleCategoryClick = (id: string | null) => {
    setActiveCategory(id);
    fetchAllProducts(id || undefined); // Fetch products for the selected category
  };

  return (
    <section className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-4 px-4 mb-4 md:mb-8">
        <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
          <PackageSearch className="w-6 h-6 text-(--color-background)" />
        </div>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">All Products</h2>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex space-x-4 overflow-x-auto mb-6 pb-0 px-2 border-b border-(--color-border) scrollbar-hide" style={{scrollbarWidth: "none"}}>
        <button
          onClick={() => handleCategoryClick(null)}
          className={`flex flex-col items-center px-3 py-2 transition text-sm ${
            !activeCategory
              ? "text-(--color-primary) border-b-2 border-(--color-primary)"
              : "text-gray-500 hover:text-(--color-primary)"
          }`}
        >
          <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
            <LucideIcons.SquareKanban/>
          </span>
          All
        </button>

        {categories.map((cat) => {
          const IconComponent = cat.icon
            ? (LucideIcons[cat.icon as keyof typeof LucideIcons] as React.ElementType<LucideProps>)
            : null;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex flex-col items-center px-3 py-2 transition text-sm ${
                activeCategory === cat.id
                  ? "text-(--color-primary) border-b-2 border-(--color-primary)"
                  : "text-gray-500 hover:text-(--color-primary)"
              }`}
            >
              <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {IconComponent ? (
                  <IconComponent size={24} />
                ) : (
                  <LucideIcons.TypeOutline/>
                )}
              </span>
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Loading, Error, and No Products Messages */}
      {loading && <p className="text-center text-gray-500">Loading products...</p>}
      {error && <p className="text-center text-(--color-error)">Error: {error}</p>}
      {!loading && products.length === 0 && !error && (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
        {products.map((product) => {
          // Calculate timeLeftMs on the client-side based on saleEnd
          let timeLeftMs = 0;
          if (product.saleEnd && product.saleStart) {
            const saleEndDate = new Date(product.saleEnd).getTime();
            const now = new Date().getTime();
            timeLeftMs = saleEndDate - now;
          }

          return (
            <div key={product.id} className="flex-none">
              <ProductCard
                product={{
                  ...product,
                  // Ensure width and height are numbers or null, as per ProductCard's Product interface
                  width: product.width !== null && product.width !== undefined ? Number(product.width) : null,
                  height: product.height !== null && product.height !== undefined ? Number(product.height) : null,
                  timeLeftMs: timeLeftMs > 0 ? timeLeftMs : null, // Pass calculated timeLeftMs
                  isFlashSale: (timeLeftMs > 0),
                }}
                // Show timer only if it's a flash sale AND calculated timeLeftMs is positive
                showTimer={ timeLeftMs > 0}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
