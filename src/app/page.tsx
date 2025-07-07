// src/app/page.tsx
import React from 'react';
import HeroBanner from "@/_components/HeroBanner";
import BestDiscounts, { Product } from "@/_components/BestDiscounts";
import BestOfferBanner from "@/_components/BestOfferBanner"; // BestOfferBanner is now static
import BrowseByCategory, { Category } from "@/_components/BrowseByCategory";
import NewArrivals from "@/_components/NewArrivals";

// Function to fetch best discount products on the server
async function getBestDiscountProducts(): Promise<Product[]> {
  try {
    // Using NEXT_PUBLIC_APP_URL as per user preference
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/products?type=discounted&limit=8`;
    const res = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server-side fetch error for best discounts:", errorData.error);
      return [];
    }

    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch best discount products server-side:", error);
    return [];
  }
}

// Function to fetch latest products on the server
async function getLatestProducts(): Promise<Product[]> {
  try {
    // Using NEXT_PUBLIC_APP_URL as per user preference
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/products?type=latest&limit=4`;
    const res = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server-side fetch error for new arrivals:", errorData.error);
      return [];
    }

    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch new arrivals server-side:", error);
    return [];
  }
}

// Function to fetch categories on the server
async function getCategories(): Promise<Category[]> {
  try {
    // Using NEXT_PUBLIC_APP_URL as per user preference
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/categories`;
    const res = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server-side fetch error for categories:", errorData.error);
      return [];
    }

    const result = await res.json();
    if (result.success && result.category) {
      return result.category;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch categories server-side:", error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch only the dynamic data needed
  const [
    bestDiscountProducts,
    latestProducts,
    categories
  ] = await Promise.all([
    getBestDiscountProducts(),
    getLatestProducts(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner />
      <BestDiscounts initialProducts={bestDiscountProducts} />
      <BestOfferBanner /> {/* No initialProduct prop needed now */}
      <BrowseByCategory initialCategories={categories} />
      <div className="flex justify-center mt-8">
        <hr className="my-8 border-gray-200 w-[88%]" />
      </div>
      <NewArrivals initialProducts={latestProducts} />
    </div>
  );
}