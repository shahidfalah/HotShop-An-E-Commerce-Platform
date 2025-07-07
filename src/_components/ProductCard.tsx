/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/ProductCard.tsx
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react'; // To check authentication status
import { useRouter } from 'next/navigation'; // For refreshing the page/header
// @ts-ignore
import ColorThief from "colorthief";

interface ProductCounts {
  reviews: number;
  wishlists: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null; // Made optional as per your schema
  price: number;
  salePrice?: number | null;
  saleStart?: string | null; // Made optional
  saleEnd?: string | null; // Made optional
  isFlashSale?: boolean; // Made optional
  itemsSold?: number | null;
  itemLimit?: number | null;
  discountPercentage?: number | null;
  images: string[]; // Now expected to contain full public URLs
  brand?: string | null; // Made optional
  width?: number | null; // Changed to number
  height?: number | null; // Changed to number
  stock: number;
  isActive?: boolean; // Made optional
  createdAt?: string; // Made optional
  updatedAt?: string; // Made optional
  createdById?: string; // Made optional
  categoryId?: string; // Made optional
  timeLeftMs?: number | null;
  rating?: number | null;
  _count?: ProductCounts; // Made optional
}

interface ProductCardProps {
  product: Product;
  showTimer?: boolean;
  variant?: "default" | "large";
}

// Helper function to format time (HH:MM:SS)
const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

// Timer Badge Component
const TimerBadge = ({ timeLeftMs }: { timeLeftMs: number }) => {
  const [displayTime, setDisplayTime] = useState(() => formatTime(timeLeftMs));
  const remainingTimeRef = useRef(timeLeftMs);

  useEffect(() => {
    if (timeLeftMs <= 0) return;

    remainingTimeRef.current = timeLeftMs;

    const interval = setInterval(() => {
      remainingTimeRef.current -= 1000;
      const currentRemaining = remainingTimeRef.current;
      setDisplayTime(formatTime(currentRemaining));

      if (currentRemaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftMs]);

  return (
    <div
      className="bg-(--color-primary) text-white text-xs font-semibold px-3 py-1 rounded-t-md border-1 border-b-0 border-l-(--color-background) border-r-(--color-primary) border-top-(--color-primary)"
      style={{ width: "fit-content" }}
    >
      {displayTime}
    </div>
  );
};

// Wishlist Icon Component
const WishlistIcon = ({
  isWishlisted,
  onClick,
}: {
  isWishlisted: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Add to wishlist"
  >
    <Heart
      className={`w-4 h-4 transition-colors duration-200 ${
        isWishlisted
          ? "fill-(--color-primary) text-(--color-primary)"
          : "text-gray-600 hover:text-(--color-primary)"
      }`}
    />
  </button>
);

// Quick View Icon Component
const QuickViewIcon = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Quick view"
  >
    <Eye className="w-4 h-4 text-gray-600 hover:text-(--color-primary) transition-colors duration-200" />
  </button>
);

// Action Buttons Component (Wishlist + Quick View)
const ActionButtons = ({
  isWishlisted,
  onWishlistClick,
  onQuickViewClick,
}: {
  isWishlisted: boolean;
  onWishlistClick: () => void;
  onQuickViewClick?: () => void;
}) => (
  <div className="absolute top-3 right-3 flex flex-col space-y-2 z-20">
    <WishlistIcon isWishlisted={isWishlisted} onClick={onWishlistClick} />
    <QuickViewIcon onClick={onQuickViewClick} />
  </div>
);

// Product Image Component
const ProductImage = ({
  product,
  variant,
  isHovered,
}: {
  product: ProductCardProps["product"];
  variant: string;
  isHovered: boolean;
}) => {
  // publicURL state and fetchImageUrl logic are removed.
  // The image source will now come directly from product.images[0]
  const [bgColor, setBgColor] = useState<string>("rgb(243, 244, 246)"); // Default light gray background
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    // Ensure imgRef.current is an HTMLImageElement and ColorThief is available
    if (imgRef.current && typeof window !== 'undefined' && typeof ColorThief !== 'undefined') {
      try {
        // Create a temporary image element to avoid CORS issues with ColorThief if the image is from a different origin
        // This is important if your Supabase images are on a different domain than your app.
        const tempImg = new window.Image();
        tempImg.crossOrigin = 'Anonymous';
        tempImg.src = imgRef.current.src;

        tempImg.onload = () => {
          try {
            const colorThief = new ColorThief();
            const color = colorThief.getColor(tempImg);
            setBgColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
          } catch (err) {
            console.error("Color extraction failed:", err);
            setBgColor("rgb(243, 244, 246)"); // Fallback on error
          }
        };

        tempImg.onerror = () => {
          console.warn("Failed to load image for color extraction (tempImg).");
          setBgColor("rgb(243, 244, 246)");
        };

      } catch (err) {
        console.error("Color extraction setup failed:", err);
        setBgColor("rgb(243, 244, 246)");
      }
    } else if (typeof ColorThief === 'undefined') {
      console.warn("ColorThief not loaded. Ensure the script is included in layout.tsx.");
      setBgColor("rgb(243, 244, 246)");
    }
  }, []);

  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : "/placeholder.svg";

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${
        variant === "large" ? "h-64" : "h-48"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <Image
        width={variant === "large" ? 250 : 200}
        height={variant === "large" ? 250 : 200}
        ref={imgRef}
        src={imageUrl}
        alt={product.title || "Product image"}
        onLoad={handleImageLoad}
        onError={() => {
          // Fallback for image display if the URL itself fails to load
          console.error("Image display failed for:", imageUrl);
          // Optionally set a local fallback image if the provided URL fails
          if (imgRef.current) imgRef.current.src = "/placeholder.svg";
          setBgColor("rgb(243, 244, 246)");
        }}
        className={`object-contain w-full h-full p-4 transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
      />
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center space-x-1">
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
  </div>
);

// Price Component
const ProductPrice = ({
  price,
  salePrice,
}: {
  price: number;
  salePrice?: number | null;
}) => (
  <div className="flex items-center space-x-2">
    {salePrice !== null && salePrice !== undefined && salePrice < price ? (
      <>
        <span className="text-lg font-semibold text-(--color-primary)">
          ${salePrice.toFixed(2)}
        </span>
        <span className="text-sm text-gray-400 line-through">
          ${price.toFixed(2)}
        </span>
      </>
    ) : (
      <span className="text-lg font-semibold text-gray-900">
        ${price.toFixed(2)}
      </span>
    )}
  </div>
);

// Add to Cart Button Component
const AddToCartButton = ({
  onAddToCart,
  product,
  isAddingToCart,
}: {
  onAddToCart: (e: React.MouseEvent) => void;
  product: Product;
  isAddingToCart: boolean;
  addToCartMessage: { type: 'success' | 'error', text: string } | null;
}) => {
  return (
    <>
      <Button
        onClick={onAddToCart}
        className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-200 py-2.5 text-sm font-medium rounded-md flex items-center justify-center gap-2"
        size="sm"
        disabled={product.stock === 0 || isAddingToCart}
      >
        {isAddingToCart ? (
          "Adding..."
        ) : product.stock === 0 ? (
          "Out of Stock"
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Add to Cart Message */}
      {/* {addToCartMessage && (
        <div className={`mt-2 p-2 text-xs rounded-md flex items-center gap-1 ${
          addToCartMessage.type === 'success'
            ? 'bg-(--color-success-bg) text-(--color-success) border border-(--color-success)'
            : 'bg-(--color-error-bg) text-(--color-error) border border-(--color-error)'
        }`}>
          {addToCartMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{addToCartMessage.text}</span>
        </div>
      )} */}
    </>
  );
};

// Discount Badge Component - Adjusted for top-left corner
const DiscountBadge = ({ percentage }: { percentage: number }) => {
  if (percentage <= 0) return null; // Don't render if no positive discount

  return (
    <div
      className="absolute top-0 left-0 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-br-md z-10" // Red background, rounded bottom-right and top-left
      style={{ width: "fit-content" }}
    >
      {percentage}% Off!
    </div>
  );
};

// Product Content Component
const ProductContent = ({
  product,
  onAddToCart,
  isAddingToCart,
  addToCartMessage,
}: {
  product: ProductCardProps["product"];
  onAddToCart: (e: React.MouseEvent) => void;
  isAddingToCart: boolean;
  addToCartMessage: { type: 'success' | 'error', text: string } | null;
}) => (
  <div className="p-4 space-y-3">
    <h3 className="font-medium text-gray-900 text-sm leading-tight hover:text-blue-500 transition-colors duration-200 line-clamp-2">
      {product.title}
    </h3>

    <ProductPrice price={product.price} salePrice={product.salePrice} />

    {product.rating !== null && product.rating !== undefined && product.rating > 0 && (
      <StarRating rating={product.rating} />
    )}

    {product.itemsSold !== null && product.itemsSold !== undefined &&
      product.itemLimit !== null && product.itemLimit !== undefined &&
      (product.itemLimit - product.itemsSold > 0) && (
      <div className="text-xs text-gray-600">
        Only {product.itemLimit - product.itemsSold} items left!
      </div>
    )}

    {/* {product.discountPercentage !== null && product.discountPercentage !== undefined && (
      <div className="text-xs text-green-600 font-semibold">
        {product.discountPercentage}% Off!
      </div>
    )} */}

    <AddToCartButton
      onAddToCart={onAddToCart}
      product={product}
      isAddingToCart={isAddingToCart}
      addToCartMessage={addToCartMessage}
    />
  </div>
);

// Main ProductCard Component
export default function ProductCard({
  product,
  showTimer = false,
  variant = "default",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { status } = useSession();
  const router = useRouter();


  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
    console.log(`${isWishlisted ? "Removed from" : "Added to"} wishlist:`, product.title);
  };

  const handleQuickViewClick = () => {
    console.log("Quick view:", product.title);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    e.stopPropagation(); // Stop event propagation if clicked on button within link

    setAddToCartMessage(null); // Clear previous messages
    setIsAddingToCart(true);

    if (status === "unauthenticated") {
      setAddToCartMessage({ type: 'error', text: 'Please log in to add items to your cart.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000); // Clear message after 3 seconds
      return;
    }

    if (product.stock === 0) {
      setAddToCartMessage({ type: 'error', text: 'This product is out of stock.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000); // Clear message after 3 seconds
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }), // Add 1 item by default
      });

      // --- START OF MODIFICATION ---
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text(); // Read as text to see the HTML
        console.error("Non-JSON response from /api/cart:", errorText);
        throw new Error(`Server responded with non-JSON content (Status: ${response.status}). Check server logs for details.`);
      }
      // --- END OF MODIFICATION ---

      const json = await response.json(); // Now this should only run if content-type is JSON

      if (!response.ok) {
        throw new Error(json.message || "Failed to add product to cart.");
      }

      setAddToCartMessage({ type: 'success', text: `${product.title} added to cart!` });
      router.refresh(); // Trigger a re-fetch of session data (which includes cart count in header)

    } catch (err: any) {
      console.error("Error adding to cart from card:", err);
      setAddToCartMessage({ type: 'error', text: err.message || "An unexpected error occurred." });
    } finally {
      setIsAddingToCart(false);
      // Clear message after a few seconds
      setTimeout(() => setAddToCartMessage(null), 3000);
    }
  };

  // Determine if a timer or discount badge should be shown
  // const hasTimer = showTimer && product.timeLeftMs !== null && product.timeLeftMs !== undefined && product.timeLeftMs > 0;
  const hasDiscount = product.discountPercentage !== null && product.discountPercentage !== undefined && product.discountPercentage > 0;

  // Calculate the top offset for the timer if both are present
  // const timerOffsetTop = hasDiscount ? 40 : 2; // If discount is there, push timer down


  return (
    <div
      className={`relative ${
        variant === "large" ? "w-full max-w-sm" : "w-full min-w-(250px) max-w-(280px)" // Fixed Tailwind CSS syntax
      } mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showTimer && product.timeLeftMs !== null && product.timeLeftMs !== undefined && product.timeLeftMs > 0 && (
        <TimerBadge timeLeftMs={product.timeLeftMs} />
      )}

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative bg-gray-50 overflow-hidden">
            {hasDiscount && (
              <DiscountBadge percentage={product.discountPercentage!} />
            )}
            <ActionButtons
              isWishlisted={isWishlisted}
              onWishlistClick={handleWishlistClick}
              onQuickViewClick={handleQuickViewClick}
            />
            <ProductImage product={product} variant={variant} isHovered={isHovered} />
          </div>
        </Link>

        <ProductContent
          product={product}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          addToCartMessage={addToCartMessage}
        />

        <div
          className={`absolute inset-0 bg-opacity-0 transition-all duration-300 pointer-events-none ${
            isHovered ? "bg-opacity-5" : ""
          }`}
        />
      </div>
    </div>
  );
}

// Export individual components for reuse if needed
export {
  TimerBadge,
  WishlistIcon,
  QuickViewIcon,
  ActionButtons,
  ProductImage,
  StarRating,
  ProductPrice,
  AddToCartButton,
  ProductContent,
};
