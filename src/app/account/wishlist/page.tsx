/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/wishlist/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Heart, ShoppingCart, Loader2, XCircle as XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/_components/ui/button";
import { dispatchCartUpdated, dispatchWishlistUpdated } from '@/lib/events';
import { toast } from 'react-hot-toast';

// Define interfaces based on your API response for wishlist items
interface WishlistedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  isInCartByUser?: boolean;
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
  const { status: authStatus } = useSession();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingOrRemovingCart, setIsAddingOrRemovingCart] = useState<string | null>(null);

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
    if (authStatus === "unauthenticated") {
      router.push('/login');
    } else if (authStatus === "authenticated") {
      fetchWishlist();
    }
  }, [authStatus, router, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
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

      toast.success('Item removed from wishlist!');
      fetchWishlist();
      dispatchWishlistUpdated();

    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      toast.error(err.message || "An error occurred.");
    }
  };

  // Function to handle adding to cart (from ProductCard logic)
  const handleAddToCart = async (productId: string, productTitle: string, productStock: number) => {
    setIsAddingOrRemovingCart(productId); // Set loading state for this specific product

    if (authStatus === "unauthenticated") {
      toast.error('Please log in to add items to your cart.');
      setIsAddingOrRemovingCart(null);
      return;
    }

    if (productStock === 0) {
      toast.error('This product is out of stock.');
      setIsAddingOrRemovingCart(null);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId, quantity: 1 }), // Add 1 item by default
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error("Non-JSON response from /api/cart:", errorText);
        throw new Error(`Server responded with non-JSON content (Status: ${response.status}). Check server logs for details.`);
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to add product to cart.");
      }

      toast.success(`${productTitle} added to cart!`);
      // Update the local state to reflect the product is now in cart
      setWishlistItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, product: { ...item.product, isInCartByUser: true } as WishlistedProduct }
            : item
        )
      );
      dispatchCartUpdated(); // Dispatch custom event

    } catch (err: any) {
      console.error("Error adding to cart from wishlist:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsAddingOrRemovingCart(null); // Reset loading state
    }
  };

  // Function to handle removing from cart (from ProductCard logic)
  const handleRemoveFromCart = async (productId: string, productTitle: string) => {
    setIsAddingOrRemovingCart(productId); // Use the same loading state for removing

    if (authStatus === "unauthenticated") {
      toast.error('Please log in to manage your cart.');
      setIsAddingOrRemovingCart(null);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE", // Use DELETE method for removal
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error("Non-JSON response from /api/cart:", errorText);
        throw new Error(`Server responded with non-JSON content (Status: ${response.status}). Check server logs for details.`);
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to remove product from cart.");
      }

      toast.success(`${productTitle} removed from cart!`);
      // Update the local state to reflect the product is no longer in cart
      setWishlistItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, product: { ...item.product, isInCartByUser: false } as WishlistedProduct }
            : item
        )
      );
      dispatchCartUpdated();

    } catch (err: any) {
      console.error("Error removing from cart from wishlist:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsAddingOrRemovingCart(null); // Reset loading state
    }
  };


  if (authStatus === "loading" || loading) {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-(--color-font) p-4 text-center">
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
    <main className="min-h-screen bg-(--color-background) text-(--color-font) p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-(--color-primary) transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">My Wishlist</h1>
        </div>

        {/* Wishlist Items List */}
        <div className="space-y-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-(--color-background) rounded-lg p-4 shadow-sm border border-(--color-border) flex flex-col sm:flex-row items-center">
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
                {/* Add to Cart / Remove from Cart Button */}
                <Button
                  onClick={() => item.product.isInCartByUser
                    ? handleRemoveFromCart(item.productId, item.product.title)
                    : handleAddToCart(item.productId, item.product.title, item.product.stock)
                  }
                  className={`px-4 py-2 text-sm flex items-center justify-center ${
                    item.product.isInCartByUser
                      ? 'bg-red-500 text-white hover:bg-red-600' // Red for remove
                      : 'bg-(--color-primary) text-(--color-background) hover:bg-(--color-primary-hover)'
                  }`}
                  disabled={item.product.stock === 0 || isAddingOrRemovingCart === item.productId}
                >
                  {isAddingOrRemovingCart === item.productId ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : item.product.isInCartByUser ? (
                    <XCircleIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  {isAddingOrRemovingCart === item.productId ? (
                    "Updating..."
                  ) : item.product.isInCartByUser ? (
                    "Remove from Cart"
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  className="border-(--color-primary) text-(--color-primary) bg-transparent hover:bg-(--color-primary) hover:text-(--color-background) px-4 py-2 text-sm flex items-center justify-center"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
