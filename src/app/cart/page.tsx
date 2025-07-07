/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, XCircle } from "lucide-react"; // Added XCircle for remove button

// Define interfaces for cart item and product structure
interface CartProduct {
  id: string;
  title: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch cart items from the API
  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart items.");
      }
      const data: CartItem[] = await response.json();
      setCartItems(data);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setError(err.message || "An error occurred while fetching your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Handle quantity change for a cart item
  const handleQuantityChange = useCallback(async (cartItemId: string, newQuantity: number) => {
    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0) // Remove if quantity becomes 0 or less
    );

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Revert optimistic update if API call fails
        fetchCartItems(); // Re-fetch to ensure consistency
        throw new Error(errorData.message || "Failed to update quantity.");
      }
      // If item was removed (quantity <= 0), the API returns 200 with a success message,
      // so we don't need to re-fetch if updatedItem is null.
      const updatedItem = await response.json();
      if (updatedItem && updatedItem.id) {
         // If a specific item was updated, ensure its product data is still included
         // (The API should return the product data with the updated item)
         setCartItems(prevItems =>
            prevItems.map(item =>
               item.id === updatedItem.id ? { ...updatedItem, product: item.product } : item
            )
         );
      } else {
         // If the item was removed (updatedItem is null or doesn't have an id), re-fetch
         fetchCartItems();
      }

    } catch (err: any) {
      console.error("Error updating cart item quantity:", err);
      setError(err.message || "Failed to update cart item quantity.");
      fetchCartItems(); // Re-fetch to revert to actual state on error
    }
  }, [fetchCartItems]);

  // Handle removing a cart item
  const handleRemoveItem = useCallback(async (cartItemId: string) => {
    // Optimistic update
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        fetchCartItems(); // Revert optimistic update on error
        throw new Error(errorData.message || "Failed to remove item.");
      }
      // No need to do anything specific if successful, optimistic update already handled it
    } catch (err: any) {
      console.error("Error removing cart item:", err);
      setError(err.message || "An error occurred while removing the item.");
      fetchCartItems(); // Re-fetch to revert to actual state on error
    }
  }, [fetchCartItems]);

  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => {
    const effectivePrice = item.product.salePrice && item.product.salePrice < item.product.price
      ? item.product.salePrice
      : item.product.price;
    return sum + (effectivePrice * item.quantity);
  }, 0);

  // For now, let's assume a static discount as per your image.
  // In a real app, this would come from coupons or promotions.
  const discount: number = 0; // Example static discount from your image
  const deliveryFee: number = 0; // Free delivery as per your image

  const total = subtotal - discount + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8 bg-(--color-background) text-(--color-font) min-h-(calc(100vh-64px))">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-(--color-muted) hover:text-(--color-primary) transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold ml-4">Shopping Cart</h1>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-(--color-muted)">Loading your cart...</p>
        </div>
      )}

      {error && (
        <div className="bg-(--color-error-bg) text-(--color-error) border border-(--color-error) p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && cartItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-(--color-muted)">Your cart is empty!</p>
          <Link href="/products">
            <Button className="mt-6 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white">
              Start Shopping
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && cartItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-4 relative">
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-(--color-muted) hover:text-(--color-error)"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
                
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 mr-4 rounded-md overflow-hidden border border-(--color-border)">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/96x96/E0E0E0/0D171C?text=No+Image`;
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-(--color-font)">{item.product.title}</h2>
                  {/* Display actual price or sale price */}
                  {item.product.salePrice && item.product.salePrice < item.product.price ? (
                    <p className="text-(--color-primary) font-bold text-md flex flex-col md:flex-row">
                      ${item.product.salePrice.toFixed(2)}
                      <span className="text-(--color-muted) line-through ml-2 text-sm">${item.product.price.toFixed(2)}</span>
                    </p>
                  ) : (
                    <p className="text-(--color-font) font-bold text-md">${item.product.price.toFixed(2)}</p>
                  )}
                  {/* Placeholder for size/color if you add them later */}
                  {/* <p className="text-(--color-muted) text-sm">Size: M</p> */}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-none text-(--color-font) bg-(--color-bg-of-icons) hover:bg-(--color-bg-of-icons-hover)"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-2 h-2 md:w-4 md:h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-10 md:w-16 text-center bg-(--color-background) border-(--color-border) text-(--color-font)"
                    min="1"
                    max={item.product.stock} // Limit by available stock
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full border-none text-(--color-font) bg-(--color-bg-of-icons) hover:bg-(--color-bg-of-icons-hover)"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock} // Disable if max stock reached
                  >
                    <Plus className="w-2 h-2 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-(--color-font)">Order Summary</h2>
            <div className="space-y-3 text-(--color-font)">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-(--color-error)">-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-(--color-border) pt-3 mt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white py-3 text-lg">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
