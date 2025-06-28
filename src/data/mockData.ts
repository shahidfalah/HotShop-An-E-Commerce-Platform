// Mock data for development - replace with actual API calls
export const mockCategories = [
  {
    id: "1",
    name: "Phones",
    slug: "phones",
    icon: "📱",
  },
  {
    id: "2",
    name: "Computers",
    slug: "computers",
    icon: "💻",
  },
  {
    id: "3",
    name: "Audio",
    slug: "audio",
    icon: "🎧",
  },
  {
    id: "4",
    name: "Wearables",
    slug: "wearables",
    icon: "⌚",
  },
]

export const mockProducts = [
  {
    id: "1",
    name: "Elegant Summer Dress",
    slug: "elegant-summer-dress",
    price: 160,
    salePrice: 120,
    saleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    images: ["/placeholder.svg?height=400&width=400"],
    stock: 15,
    category: { id: "1", name: "Fashion", slug: "fashion" },
  },
  {
    id: "2",
    name: "Gaming Controller Pro",
    slug: "gaming-controller-pro",
    price: 120,
    salePrice: 89,
    saleEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
    images: ["/placeholder.svg?height=400&width=400"],
    stock: 8,
    category: { id: "2", name: "Gaming", slug: "gaming" },
  },
]
