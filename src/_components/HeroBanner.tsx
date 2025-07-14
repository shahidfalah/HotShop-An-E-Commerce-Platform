"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/_components/ui/button"
import Image from "next/image"
import Link from "next/link" // Added Link for CTA

const bannerSlides = [
  {
    id: 1,
    title: "iPhone 14 Series",
    subtitle: "Up to 10% off Voucher",
    description: "Limited-time offers on top products. Don't miss out!",
    // Removed query params from static image path; let Next.js Image handle sizing
    image: "/images/hero-up-to-10-off-voucher.png",
    cta: "Shop Now",
    ctaLink: "/products", // Added a link for the CTA button
    bgColor: "bg-black",
  },
  {
    id: 2,
    title: "Samsung Galaxy S24",
    subtitle: "Up to 15% off",
    description: "Latest technology at unbeatable prices",
    image: "/images/hero-up-to-10-off-voucher.png",
    cta: "Shop Now",
    ctaLink: "/products",
    bgColor: "bg-black",
  },
  {
    id: 3,
    title: "MacBook Pro",
    subtitle: "Special Discount",
    description: "Professional performance for creators",
    image: "/images/img2.jpg",
    cta: "Shop Now",
    ctaLink: "/products",
    bgColor: "bg-[#0a0a0a]",
  },
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const currentBanner = bannerSlides[currentSlide]

  return (
    <section className="relative overflow-hidden">
      <div className={`${currentBanner.bgColor} text-white transition-all duration-500`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center min-h-[400px] lg:min-h-[500px] py-8 lg:py-16 md:px-16 px-auto">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <span className="text-white/80 text-sm">🍎</span>
                <span className="ml-2 text-white/80 text-sm">{currentBanner.title}</span>
              </div>

              <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                {currentBanner.subtitle}
              </h1>

              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto lg:mx-0">{currentBanner.description}</p>

              {/* Added Link to the Button */}
              <Link href={currentBanner.ctaLink || "#"} passHref>
                <Button
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 text-lg"
                  size="lg"
                >
                  {currentBanner.cta} →
                </Button>
              </Link>
            </div>

            {/* Image */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src={currentBanner.image || "/placeholder.svg"}
                  alt={currentBanner.title || "Hero banner image"} // Improved alt text
                  width={600} // Set explicit width
                  height={400} // Set explicit height
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
