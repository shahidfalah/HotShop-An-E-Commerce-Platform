"use client"

import { useEffect } from "react"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"
import ProductCard from "./ProductCard"
import { Button } from "@/_components/ui/button"
import productsData from "../data/products.json"

export default function FlashSales() {
  // const [timeLeft, setTimeLeft] = useState({
  //   days: 3,
  //   hours: 23,
  //   minutes: 19,
  //   seconds: 56,
  // })

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      // setTimeLeft((prev) => {
      //   if (prev.seconds > 0) {
      //     return { ...prev, seconds: prev.seconds - 1 }
      //   } else if (prev.minutes > 0) {
      //     return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
      //   } else if (prev.hours > 0) {
      //     return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
      //   } else if (prev.days > 0) {
      //     return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
      //   }
      //   return prev
      // })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("flash-sales-container")
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-12 bg-white px-[88px]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center space-x-4 px-4">

            <div className="w-10 h-12 bg-(--color-primary) rounded flex items-center justify-center">
              <PackageSearch className="w-6 h-6 text-(--color-background)" />
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Flash Sales</h2>
              {/* <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">Ends in:</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold min-w-[40px] text-center">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <span className="text-red-500 font-bold">:</span>
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold min-w-[40px] text-center">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <span className="text-red-500 font-bold">:</span>
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold min-w-[40px] text-center">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <span className="text-red-500 font-bold">:</span>
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold min-w-[40px] text-center">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                </div>
              </div> */}
            </div>

          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollContainer("left")}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollContainer("right")}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div
            id="flash-sales-container"
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {productsData.flashSales.map((product) => (
              <div key={product.id} className="flex-none w-72 md:w-80">
                <ProductCard product={product} showTimer={true} />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-8 py-3" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
