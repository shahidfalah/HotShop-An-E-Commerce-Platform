import { SprayCan } from "lucide-react"
import { Button } from "@/_components/ui/button"
import Image from "next/image"
import productsData from "../data/products.json"

export default function NewArrivals() {
  const [mainProduct, ...otherProducts] = productsData.newArrivals

  return (
    <section id="new-arrivals" className="py-12 bg-white px-[16px] md:px-[88px]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
              <SprayCan className="w-6 h-6 text-(--color-background)" />
            </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-gray-600 mt-1">Latest products just for you</p>
          </div>
        </div>

        {/* Products Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Featured Product */}
          <div className="bg-black rounded-lg overflow-hidden text-white relative group">
            <div className="p-8 lg:p-12 h-full flex flex-col justify-end relative z-10">
              <div className="mb-4">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">{mainProduct.title}</h3>
                <p className="text-gray-300 mb-4">{mainProduct.description}</p>
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Shop Now
                </Button>
              </div>
            </div>
            <div className="absolute inset-0">
              <Image
                src={mainProduct.image || "/placeholder.svg"}
                alt={mainProduct.title}
                fill
                className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Secondary Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Women's Collections */}
            <div className="bg-gray-900 rounded-lg overflow-hidden text-white relative group">
              <div className="p-6 h-full flex flex-col justify-end relative z-10">
                <h3 className="text-xl font-bold mb-2">{otherProducts[0]?.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{otherProducts[0]?.description}</p>
                <Button
                  size="sm"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300 w-fit"
                >
                  Shop Now
                </Button>
              </div>
              <div className="absolute inset-0">
                <Image
                  src={otherProducts[0]?.image || "/placeholder.svg?height=300&width=300"}
                  alt={otherProducts[0]?.title || "Product"}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-gray-800 rounded-lg overflow-hidden text-white relative group">
              <div className="p-6 h-full flex flex-col justify-end relative z-10">
                <h3 className="text-xl font-bold mb-2">{otherProducts[1]?.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{otherProducts[1]?.description}</p>
                <Button
                  size="sm"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300 w-fit"
                >
                  Shop Now
                </Button>
              </div>
              <div className="absolute inset-0">
                <Image
                  src={otherProducts[1]?.image || "/placeholder.svg?height=200&width=200"}
                  alt={otherProducts[1]?.title || "Product"}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
              </div>
            </div>

            {/* Perfume */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg overflow-hidden text-white relative group sm:col-span-2">
              <div className="p-6 h-full flex flex-col justify-end relative z-10">
                <h3 className="text-xl font-bold mb-2">{otherProducts[2]?.title}</h3>
                <p className="text-gray-100 text-sm mb-4">{otherProducts[2]?.description}</p>
                <Button
                  size="sm"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-amber-800 transition-all duration-300 w-fit"
                >
                  Shop Now
                </Button>
              </div>
              <div className="absolute inset-0">
                <Image
                  src={otherProducts[2]?.image || "/placeholder.svg?height=200&width=200"}
                  alt={otherProducts[2]?.title || "Product"}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
