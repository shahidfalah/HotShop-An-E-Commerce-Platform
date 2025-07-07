// src/_components/ProductCard.tsx
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import ColorThief from "colorthief";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images: string[]; // Now expected to contain full public URLs
    discountPercentage?: number | null;
    timeLeftMs?: number | null;
    rating?: number | null;
    itemsSold?: number | null;
    itemLimit?: number | null;
  };
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
      className="bg-(--color-primary) text-white text-xs font-semibold px-3 py-1 rounded-t-md"
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
        tempImg.crossOrigin = 'Anonymous'; // Required for ColorThief on external images
        tempImg.src = imgRef.current.src; // Use the src from the actual Image component

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
          setBgColor("rgb(243, 244, 246)"); // Fallback on error
        };

      } catch (err) {
        console.error("Color extraction setup failed:", err);
        setBgColor("rgb(243, 244, 246)"); // Fallback on error
      }
    } else if (typeof ColorThief === 'undefined') {
      console.warn("ColorThief not loaded. Ensure the script is included in layout.tsx.");
      setBgColor("rgb(243, 244, 246)"); // Fallback if ColorThief is missing
    }
  }, []);

  // Determine the image source. It should now be a full URL from the product prop.
  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : "/placeholder.svg"; // Fallback to a local placeholder if no image URL is provided

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
        src={imageUrl} // Directly use the URL from   props
        alt={product.title || "Product image"}
        onLoad={handleImageLoad} // Trigger color extraction on load
        onError={() => {
          // Fallback for image display if the URL itself fails to load
          console.error("Image display failed for:", imageUrl);
          // Optionally set a local fallback image if the provided URL fails
          if (imgRef.current) imgRef.current.src = "/placeholder.svg";
          setBgColor("rgb(243, 244, 246)"); // Ensure background is reset
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
}: {
  onAddToCart?: () => void;
}) => (
  <Button
    onClick={onAddToCart}
    className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-200 py-2.5 text-sm font-medium rounded-md"
    size="sm"
  >
    <ShoppingBag className="w-4 h-4 mr-2" />
    Add To Cart
  </Button>
);

// Product Content Component
const ProductContent = ({
  product,
  onAddToCart,
}: {
  product: ProductCardProps["product"];
  onAddToCart?: () => void;
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

    {product.discountPercentage !== null && product.discountPercentage !== undefined && (
      <div className="text-xs text-green-600 font-semibold">
        {product.discountPercentage}% Off!
      </div>
    )}

    <AddToCartButton onAddToCart={onAddToCart} />
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

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
    console.log(`${isWishlisted ? "Removed from" : "Added to"} wishlist:`, product.title);
  };

  const handleQuickViewClick = () => {
    console.log("Quick view:", product.title);
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", product.title);
  };

  return (
    <div
      className={`relative ${
        variant === "large" ? "w-full max-w-sm" : "w-full min-w-[250px] max-w-[280px]"
      } mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showTimer && product.timeLeftMs !== null && product.timeLeftMs !== undefined && product.timeLeftMs > 0 && (
        <TimerBadge timeLeftMs={product.timeLeftMs} />
      )}

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group">
        <Link href={`/products/${product.slug}`} className="block"> {/* Changed link to generic product page */}
          <div className="relative bg-gray-50 overflow-hidden">
            <ActionButtons
              isWishlisted={isWishlisted}
              onWishlistClick={handleWishlistClick}
              onQuickViewClick={handleQuickViewClick}
            />
            <ProductImage product={product} variant={variant} isHovered={isHovered} />
          </div>
        </Link>

        <ProductContent product={product} onAddToCart={handleAddToCart} />

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