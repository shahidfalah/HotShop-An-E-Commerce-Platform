"use client"

import { ArrowLeft, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Mock wishlist data - replace with your actual data fetching
const mockWishlistItems = [
  {
    id: 1,
    title: "Wireless Headphones",
    price: 199.99,
    image: "/placeholder.svg?height=80&width=80",
    inStock: true,
  },
  {
    id: 2,
    title: "Smart Watch",
    price: 299.99,
    image: "/placeholder.svg?height=80&width=80",
    inStock: false,
  },
  {
    id: 3,
    title: "Gaming Controller",
    price: 89.99,
    image: "/placeholder.svg?height=80&width=80",
    inStock: true,
  },
]

export default function WishlistPage() {
  const router = useRouter()

  const handleRemoveItem = (id: number) => {
    // Add your remove from wishlist logic here
    console.log("Remove item:", id)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full bg-surface shadow-custom">
            <ArrowLeft className="w-5 h-5 text-font" />
          </button>
          <h1 className="text-2xl font-bold text-font">Wishlist</h1>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {mockWishlistItems.map((item) => (
            <div key={item.id} className="bg-surface rounded-xl p-4 shadow-custom">
              <div className="flex items-center space-x-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-font mb-1">{item.title}</h3>
                  <p className="text-primary font-bold text-lg">${item.price}</p>
                  <p className={`text-sm ${item.inStock ? "text-success" : "text-error"}`}>
                    {item.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 rounded-full bg-error-bg hover:bg-error text-error hover:text-white transition-custom"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
