/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/ProductCard.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Eye, ShoppingCart, Loader2 } from 'lucide-react'; // Added Loader2 for loading state
import { Button } from "@/_components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react'; // To check authentication status
import { toast } from 'react-hot-toast'; // For notifications
import { dispatchCartUpdated, dispatchWishlistUpdated } from '@/lib/events'; // Import custom event dispatchers

interface ProductCounts {
  reviews: number;
  wishlists: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  saleStart?: string | null;
  saleEnd?: string | null;
  isFlashSale?: boolean;
  images: string[];
  brand?: string | null;
  width?: number | null;
  height?: number | null;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  categoryId?: string;
  timeLeftMs?: number | null; // Re-added timeLeftMs to the interface as it's passed from parent
  rating?: number | null;
  isWishlistedByUser?: boolean; // Added for client-side state
  _count?: ProductCounts;
}

interface ProductCardProps {
  product: Product;
  showTimer?: boolean; // Controls whether the timer badge is shown
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
      className="bg-(--color-primary) text-white text-xs font-semibold px-3 py-1 rounded-t-md w-[80.4px] text-center"
    >
      {displayTime}
    </div>
  );
};

// Wishlist Icon Component
const WishlistIcon = ({
  isWishlisted,
  onClick,
  isUpdating, // New prop for loading state
}: {
  isWishlisted: boolean;
  onClick: (e: React.MouseEvent) => void; // Expects an event
  isUpdating: boolean;
}) => (
  <button
    onClick={onClick}
    className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Add to wishlist"
    disabled={isUpdating} // Disable button when updating
  >
    {isUpdating ? (
      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
    ) : (
      <Heart
        className={`w-4 h-4 transition-colors duration-200 ${
          isWishlisted
            ? "fill-(--color-primary) text-(--color-primary)"
            : "text-gray-600 hover:text-(--color-primary)"
        }`}
      />
    )}
  </button>
);

// Quick View Icon Component
const QuickViewIcon = ({ onClick }: { onClick?: (e: React.MouseEvent) => void }) => ( // Expects an event
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
  isWishlistUpdating, // Pass loading state
}: {
  isWishlisted: boolean;
  onWishlistClick: (e: React.MouseEvent) => void; // Expects an event
  onQuickViewClick?: (e: React.MouseEvent) => void; // Expects an event
  isWishlistUpdating: boolean;
}) => (
  <div className="absolute top-3 right-3 flex flex-col space-y-2 z-20">
    <WishlistIcon isWishlisted={isWishlisted} onClick={onWishlistClick} isUpdating={isWishlistUpdating} />
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
  const [bgColor, setBgColor] = useState<string>("rgb(243, 244, 246)"); // Default light gray background
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    // Only attempt ColorThief if it's available globally and the image is loaded
    if (imgRef.current && imgRef.current.naturalWidth > 0 && typeof window !== 'undefined' && typeof (window as any).ColorThief !== 'undefined') {
      try {
        const colorThief = new (window as any).ColorThief();
        const color = colorThief.getColor(imgRef.current); // Use the actual Image element
        if (color) {
          setBgColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
        }
      } catch (e) {
        console.error("Error extracting color:", e);
        setBgColor("rgb(243, 244, 246)");
      }
    } else if (typeof (window as any).ColorThief === 'undefined') {
      console.warn("ColorThief not loaded. Ensure the script is included in layout.tsx with 'async'.");
      setBgColor("rgb(243, 244, 246)");
    }
  }, []);

  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : `https://placehold.co/${variant === "large" ? "250x250" : "200x200"}/E0E0E0/0D171C?text=No+Image`;

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
          console.error("Image display failed for:", imageUrl);
          if (imgRef.current) imgRef.current.src = `https://placehold.co/${variant === "large" ? "250x250" : "200x200"}/E0E0E0/0D171C?text=No+Image`;
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

// Price Component - MODIFIED
const ProductPrice = ({
  price,
  salePrice,
  isFlashSale,
  timeLeftMs,
  expired,
}: {
  price: number;
  salePrice?: number | null;
  isFlashSale?: boolean;
  timeLeftMs?: number | null;
  expired? : boolean;
}) => {
  // Determine if sale price should be shown
  const showSalePrice =
    salePrice !== null &&
    salePrice !== undefined &&
    salePrice < price &&
    price > 0 &&
    (!isFlashSale || (isFlashSale && (timeLeftMs ?? 0) > 0)) && !expired; // Only show if flash sale is active or not a flash sale

  return (
    <div className="flex items-center space-x-2">
      {showSalePrice ? (
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
};

// Add to Cart Button Component
const AddToCartButton = ({
  onAddToCart,
  product,
  isAddingToCart,
}: {
  onAddToCart: (e: React.MouseEvent) => void;
  product: Product;
  isAddingToCart: boolean;
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
    </>
  );
};

// Discount Badge Component - MODIFIED
const DiscountBadge = ({
  percentage,
  isFlashSale,
  timeLeftMs,
}: {
  percentage: number;
  isFlashSale?: boolean;
  timeLeftMs?: number | null;
}) => {
  // Only show if percentage is positive AND (not a flash sale OR flash sale is active)
  const showBadge = percentage > 0 && (!isFlashSale || (isFlashSale && (timeLeftMs ?? 0) > 0));

  if (!showBadge) return null;

  return (
    <div
      className="absolute top-0 left-0 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-br-md z-10 w-[80px]" // Red background, rounded bottom-right and top-left
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
  expired,
}: {
  product: ProductCardProps["product"];
  onAddToCart: (e: React.MouseEvent) => void;
  isAddingToCart: boolean;
  expired: boolean;
}) => (
  <div className="p-4 space-y-3 h-[166px] flex flex-col">
    <h3 className="font-medium text-gray-900 text-sm leading-tight hover:text-(--color-primary) transition-colors duration-200 line-clamp-2">
      {product.title}
    </h3>

    {/* Pass isFlashSale and timeLeftMs to ProductPrice */}
    <ProductPrice
      price={product.price}
      salePrice={product.salePrice}
      isFlashSale={product.isFlashSale}
      timeLeftMs={product.timeLeftMs}
      expired={expired}
    />

    {product.rating !== null && product.rating !== undefined && product.rating > 0 && (
      <StarRating rating={product.rating} />
    )}
    
    <div className="flex-auto flex items-end">
      <AddToCartButton
        onAddToCart={onAddToCart}
        product={product}
        isAddingToCart={isAddingToCart}
      />
    </div>
  </div>
);

// Main ProductCard Component
export default function ProductCard({
  product,
  showTimer = false,
  variant = "default",
}: ProductCardProps) {
  console.log("ProductCard Props:", product)
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false); // New state for wishlist loading
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: session, status: authStatus } = useSession(); // Get session data and status

  // Calculate discount percentage
  const discountPercentage =
    product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price && product.price > 0
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  // Use timeLeftMs directly from product prop
  const timeLeftMs = product.timeLeftMs ?? 0;

  useEffect(() => {
    // This effect should ideally use the `isWishlistedByUser` prop if available
    // from the product data fetched by the API. If not, it fetches it here.
    // To avoid redundant fetches, ensure your API/ProductService populates this.
    // For now, keeping the fetch here as a fallback/initial sync.
    const fetchWishlistStatus = async () => {
      if (authStatus === "authenticated" && session?.user?.id) {
        // Prefer product.isWishlistedByUser if available and reliable
        if (typeof product.isWishlistedByUser === 'boolean') {
          setIsWishlisted(product.isWishlistedByUser);
          return;
        }
        try {
          const response = await fetch("/api/wishlist");
          if (!response.ok) {
            throw new Error("Failed to fetch wishlist status.");
          }
          const data = await response.json();
          const wishlistedItems = data.data || [];
          const productInWishlist = wishlistedItems.some((item: any) => item.productId === product.id);
          setIsWishlisted(productInWishlist);
        } catch (error) {
          console.error("Error fetching wishlist status:", error);
          // Don't show toast for this, it's a background fetch
        }
      } else {
        setIsWishlisted(false); // Not authenticated, so not wishlisted
      }
    };

    fetchWishlistStatus();
  }, [authStatus, product.id, session?.user?.id, product.isWishlistedByUser]); // Re-run when auth status or product ID changes

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    e.stopPropagation(); // Stop event propagation if clicked on button within link

    if (authStatus === "unauthenticated") {
      toast.error('Please log in to manage your wishlist.');
      return;
    }

    setIsWishlistUpdating(true);
    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const response = await fetch("/api/wishlist", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isWishlisted ? "remove from" : "add to"} wishlist.`);
      }

      // Toggle wishlist status locally
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? `Removed ${product.title} from wishlist!` : `Added ${product.title} to wishlist!`);
      dispatchWishlistUpdated(); // Dispatch custom event

    } catch (err: any) {
      console.error("Error updating wishlist:", err);
      toast.error(err.message || "An unexpected error occurred with wishlist.");
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    e.stopPropagation(); // Stop event propagation if clicked on button within link
    console.log("Quick view:", product.title);
    // Implement quick view modal logic here
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    e.stopPropagation(); // Stop event propagation if clicked on button within link

    setIsAddingToCart(true);

    if (authStatus === "unauthenticated") {
      toast.error('Please log in to add items to your cart.');
      setIsAddingToCart(false);
      return;
    }

    if (product.stock === 0) {
      toast.error('This product is out of stock.');
      setIsAddingToCart(false);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }), // Add 1 item by default
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

      toast.success(`${product.title} added to cart!`);
      dispatchCartUpdated(); // Dispatch custom event

    } catch (err: any) {
      console.error("Error adding to cart from card:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Determine if the timer is active (only if showTimer is true and timeLeftMs > 0)
  const isTimerActive = showTimer && timeLeftMs > 0;

  const expired = (product.saleStart && product.saleEnd && new Date(product.saleEnd) < new Date()) as boolean;

  return (
    <div
      className={`relative ${
        variant === "large" ? "w-full max-w-sm" : "w-full min-w-[250px] max-w-[270px]"
      } mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timer Badge - Only show if isFlashSale and timeLeftMs > 0 */}
      { isTimerActive && (
        <TimerBadge timeLeftMs={timeLeftMs} />
      )}

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative bg-gray-50 overflow-hidden">
            {/* Discount Badge - Only show if discountPercentage > 0 AND (NOT flash sale OR flash sale is active) */}
            {discountPercentage !== null && discountPercentage > 0 &&
             (!product.isFlashSale || (product.isFlashSale && isTimerActive)) && !expired && (
              <DiscountBadge
                percentage={discountPercentage}
                isFlashSale={product.isFlashSale}
                timeLeftMs={timeLeftMs}
              />
            )}
            <ActionButtons
              isWishlisted={isWishlisted}
              onWishlistClick={handleWishlistClick}
              onQuickViewClick={handleQuickViewClick}
              isWishlistUpdating={isWishlistUpdating}
            />
            <ProductImage product={product} variant={variant} isHovered={isHovered} />
          </div>
        </Link>

        <ProductContent
          product={product}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          expired={expired}
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
  DiscountBadge, // Exported for potential reuse
};
