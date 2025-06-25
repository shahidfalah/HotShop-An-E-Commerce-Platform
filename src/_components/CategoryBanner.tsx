"use client"

import { useState, useEffect } from "react"
import { Button } from "@/_components/ui/button"
import Image from "next/image"

export default function CategoryBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 23,
    hours: 5,
    minutes: 59,
    seconds: 35,
  })

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center min-h-[400px]">
            {/* Content */}
            <div className="flex-1 text-white p-8 lg:p-12">
              <div className="mb-4">
                <span className="text-[#F39C12] text-sm font-semibold">Categories</span>
              </div>

              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                Enhance Your
                <br />
                Music Experience
              </h2>

              {/* Countdown Timer */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="text-center">
                  <div className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <span className="text-xs text-gray-300 mt-1">Days</span>
                </div>
                <div className="text-center">
                  <div className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <span className="text-xs text-gray-300 mt-1">Hours</span>
                </div>
                <div className="text-center">
                  <div className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <span className="text-xs text-gray-300 mt-1">Minutes</span>
                </div>
                <div className="text-center">
                  <div className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <span className="text-xs text-gray-300 mt-1">Seconds</span>
                </div>
              </div>

              <Button className="bg-[#F39C12] hover:bg-[#CA820F] text-white px-8 py-3 text-lg font-semibold" size="lg">
                Buy Now!
              </Button>
            </div>

            {/* Image */}
            <div className="flex-1 relative p-8 lg:p-12">
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Premium Headphones"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
