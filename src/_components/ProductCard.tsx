"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Star } from "lucide-react"
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

export default function ProductCard({ product, showTimer = false, variant = "default" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group ${
        variant === "large" ? "h-auto" : "h-full"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative bg-gray-50 overflow-hidden">
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            -{discountPercentage}%
          </div>
        )}

        {/* Timer Badge */}
        {showTimer && product.timeLeft && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            {product.timeLeft}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 z-10"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          />
        </button>

        {/* Product Image */}
        <div className={`${variant === "large" ? "h-64" : "h-48"} relative overflow-hidden`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            fill
            className={`object-cover transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"}`}
          />
        </div>

        {/* Quick Add to Cart - Shows on Hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-3 transform transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <Button className="w-full bg-white text-black hover:bg-gray-100 transition-colors duration-200" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add To Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-500 transition-colors duration-200">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-red-500">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>

        {/* Add to Cart Button - Always Visible on Mobile */}
        <Button
          className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 md:hidden"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add To Cart
        </Button>
      </div>
    </div>
  )
}
