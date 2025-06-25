"use client"

import { useState } from "react"
import { Heart, Eye, ShoppingBag } from "lucide-react"
import { Button } from "@/_components/ui/button"
import Image from "next/image"

interface ProductCardProps {
  product: {
    id: number
    title: string
    price: number
    originalPrice?: number
    image: string
    discount?: number
    timeLeft?: string
    rating?: number
  }
  showTimer?: boolean
  variant?: "default" | "large"
}

// Timer Badge Component
const TimerBadge = ({ timeLeft }: { timeLeft: string }) => (
  <div className="bg-(--color-primary) text-white text-xs font-semibold px-3 py-1 rounded-t-md" style={{width: "fit-content"}}>
    {timeLeft}
  </div>
)

// Wishlist Icon Component
const WishlistIcon = ({ isWishlisted, onClick }: { isWishlisted: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Add to wishlist"
  >
    <Heart
      className={`w-4 h-4 transition-colors duration-200 ${
        isWishlisted ? "fill-(--color-primary) text-(--color-primary)" : "text-gray-600 hover:text-(--color-primary)"
      }`}
    />
  </button>
)

// Quick View Icon Component
const QuickViewIcon = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Quick view"
  >
    <Eye className="w-4 h-4 text-gray-600 hover:text-(--color-primary) transition-colors duration-200" />
  </button>
)

// Action Buttons Component (Wishlist + Quick View)
const ActionButtons = ({
  isWishlisted,
  onWishlistClick,
  onQuickViewClick,
}: {
  isWishlisted: boolean
  onWishlistClick: () => void
  onQuickViewClick?: () => void
}) => (
  <div className="absolute top-3 right-3 flex flex-col space-y-2 z-20">
    <WishlistIcon isWishlisted={isWishlisted} onClick={onWishlistClick} />
    <QuickViewIcon onClick={onQuickViewClick} />
  </div>
)

// Product Image Component
const ProductImage = ({
  product,
  variant,
  isHovered,
}: {
  product: ProductCardProps["product"]
  variant: string
  isHovered: boolean
}) => (
  <div className={`${variant === "large" ? "h-64" : "h-48"} relative overflow-hidden bg-gray-100`}>
    <Image
      src={product.image || "/placeholder.svg?height=200&width=200"}
      alt={product.title}
      fill
      className={`object-contain p-4 transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
    />
  </div>
)

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center space-x-1">
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-xs text-gray-500">({rating})</span>
  </div>
)

// Price Component
const ProductPrice = ({
  price,
  originalPrice,
}: {
  price: number
  originalPrice?: number
}) => (
  <div className="flex items-center space-x-2">
    <span className="text-lg font-semibold text-(--color-primary)">${price}</span>
    {originalPrice && <span className="text-sm text-gray-400 line-through">${originalPrice}</span>}
  </div>
)

// Add to Cart Button Component
const AddToCartButton = ({
  onAddToCart,
}: {
  onAddToCart?: () => void
}) => (
  <Button
    onClick={onAddToCart}
    className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-200 py-2.5 text-sm font-medium rounded-md"
    size="sm"
  >
    <ShoppingBag className="w-4 h-4 mr-2" />
    Add To Cart
  </Button>
)

// Product Content Component (Title + Rating + Price + Button)
const ProductContent = ({
  product,
  onAddToCart,
}: {
  product: ProductCardProps["product"]
  onAddToCart?: () => void
}) => (
  <div className="p-4 space-y-3">
    {/* Product Title */}
    <h3 className="font-medium text-gray-900 text-sm leading-tight hover:text-(--color-primary) transition-colors duration-200 line-clamp-2">
      {product.title}
    </h3>

    {/* Price */}
    <ProductPrice price={product.price} originalPrice={product.originalPrice} />

    {/* Rating - Only show if exists */}
    {product.rating && <StarRating rating={product.rating} />}

    {/* Add to Cart Button */}
    <AddToCartButton onAddToCart={onAddToCart} />
  </div>
)

// Main ProductCard Component
export default function ProductCard({ product, showTimer = false, variant = "default" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Event handlers
  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
    // Add your wishlist logic here
    console.log(`${isWishlisted ? "Removed from" : "Added to"} wishlist:`, product.title)
  }

  const handleQuickViewClick = () => {
    // Add your quick view logic here
    console.log("Quick view:", product.title)
  }

  const handleAddToCart = () => {
    // Add your add to cart logic here
    console.log("Added to cart:", product.title)
  }

  return (
    <div
      className={` relative ${
        variant === "large" ? "w-full max-w-sm" : "w-full max-w-[280px]"
      } mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timer Badge */}
      {showTimer && product.timeLeft && <TimerBadge timeLeft={product.timeLeft} />}

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-(--color-border) overflow-hidden transition-all duration-300 hover:shadow-lg group">
        {/* Image Container */}
        <div className="relative bg-gray-50 overflow-hidden ">

          {/* Action Buttons */}
          <ActionButtons
            isWishlisted={isWishlisted}
            onWishlistClick={handleWishlistClick}
            onQuickViewClick={handleQuickViewClick}
          />

          {/* Product Image */}
          <ProductImage product={product} variant={variant} isHovered={isHovered} />
        </div>

        {/* Product Content */}
        <ProductContent product={product} onAddToCart={handleAddToCart} />

        {/* Hover Overlay Effect */}
        <div
          className={`absolute inset-0 bg-opacity-0 transition-all duration-300 pointer-events-none ${
            isHovered ? "bg-opacity-5" : ""
          }`}
        />
      </div>
    </div>
  )
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
}
