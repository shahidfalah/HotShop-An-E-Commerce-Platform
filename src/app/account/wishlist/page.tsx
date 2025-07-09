/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/wishlist/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Heart, ShoppingCart, Loader2, XCircle as XCircleIcon, CheckCircle } from "lucide-react"; // Renamed XCircle to XCircleIcon to avoid conflict with XCircle component
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/_components/ui/button";

// Define interfaces based on your API response for wishlist items
interface WishlistedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
}

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product: WishlistedProduct;
}

export default function WishlistPage() {
  const router = useRouter();
  const { status } = useSession();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/wishlist");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch wishlist items.");
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setWishlistItems(result.data);
      } else {
        setWishlistItems([]);
      }
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
      setError(err.message || "An error occurred while fetching your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    } else if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    setActionMessage(null);
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to remove item from wishlist.");
      }

      setActionMessage({ type: 'success', text: 'Item removed from wishlist!' });
      fetchWishlist(); // Re-fetch wishlist to update UI
      router.refresh(); // Revalidate data across the app

    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      setActionMessage({ type: 'error', text: err.message || "An error occurred." });
    } finally {
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleAddToCart = async (productId: string, productTitle: string) => {
    setActionMessage(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to add product to cart.");
      }

      setActionMessage({ type: 'success', text: `${productTitle} added to cart!` });
      // Optionally remove from wishlist after adding to cart
      // handleRemoveFromWishlist(productId);
      router.refresh();

    } catch (err: any) {
      console.error("Error adding to cart from wishlist:", err);
      setActionMessage({ type: 'error', text: err.message || "An error occurred." });
    } finally {
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background) text-gray-600">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading wishlist...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-red-600 p-4 text-center">
        <XCircleIcon className="w-12 h-12 mb-4" />
        <p className="text-xl font-semibold mb-2">Error Loading Wishlist</p>
        <p className="text-lg">{error}</p>
        <Button onClick={fetchWishlist} className="mt-6 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-gray-700 p-4 text-center">
        <Heart className="w-12 h-12 mb-4 text-gray-500" />
        <p className="text-xl font-semibold mb-2">Your Wishlist is Empty</p>
        <p className="text-lg mb-6">Start adding products you love!</p>
        <Link href="/products">
          <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-6 py-3">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-font) p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full bg-(--color-surface) shadow-md hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-(--color-font)" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">My Wishlist</h1>
        </div>

        {actionMessage && (
          <div className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Wishlist Items List */}
        <div className="space-y-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-(--color-surface) rounded-lg p-4 shadow-sm border border-(--color-border) flex flex-col sm:flex-row items-center">
              <Link href={`/products/${item.product.slug}`} className="flex-shrink-0 mr-4">
                <div className="w-24 h-24 rounded-md overflow-hidden border border-(--color-border)">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.title}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/96x96/E0E0E0/0D171C?text=No+Image`;
                    }}
                  />
                </div>
              </Link>
              
              <div className="flex-grow text-center sm:text-left mt-4 sm:mt-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-semibold text-lg text-(--color-font) hover:text-(--color-primary) transition-colors">
                    {item.product.title}
                  </h3>
                </Link>
                {item.product.salePrice && item.product.salePrice < item.product.price ? (
                  <p className="text-md font-bold text-(--color-primary)">
                    ${item.product.salePrice.toFixed(2)}
                    <span className="text-gray-400 line-through ml-2 text-sm">
                      ${item.product.price.toFixed(2)}
                    </span>
                  </p>
                ) : (
                  <p className="text-md font-bold text-(--color-font)">
                    ${item.product.price.toFixed(2)}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {item.product.stock > 0 ? `In Stock (${item.product.stock})` : "Out of Stock"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-auto">
                <Button
                  onClick={() => handleAddToCart(item.productId, item.product.title)}
                  className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm flex items-center justify-center"
                  disabled={item.product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2 text-sm flex items-center justify-center"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
