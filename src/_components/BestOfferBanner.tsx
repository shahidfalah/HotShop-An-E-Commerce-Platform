// src/_components/BestOfferBanner.tsx
"use client";

import { Button } from "@/_components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function BestOfferBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const seconds = prev.seconds - 1;
        const minutes = seconds < 0 ? prev.minutes - 1 : prev.minutes;
        const hours = minutes < 0 ? prev.hours - 1 : prev.hours;

        return {
          hours: hours < 0 ? 23 : hours,
          minutes: minutes < 0 ? 59 : minutes,
          seconds: seconds < 0 ? 59 : seconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white ">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-(--color-primary-hover) to-(--color-primary) rounded-lg overflow-hidden shadow-md py-6">
          <div className="flex flex-col md:flex-row items-center">
            {/* Content Section */}
            <div className="flex-1 p-6 md:p-8 text-center md:text-left text-white">
              <div className="mb-3">
                <span className="bg-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1 rounded-full">
                  Flash Sale
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Enhance Your
                <br />
                <span className="text-yellow-300">Music Experience</span>
              </h2>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <div className="text-center">
                  <div className="bg-black/20 rounded-md w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <span className="text-xs mt-1 text-white/80">Hours</span>
                </div>
                <div className="text-center">
                  <div className="bg-black/20 rounded-md w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <span className="text-xs mt-1 text-white/80">Minutes</span>
                </div>
                <div className="text-center">
                  <div className="bg-black/20 rounded-md w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <span className="text-xs mt-1 text-white/80">Seconds</span>
                </div>
              </div>

              <Link href="/products">
                <Button
                  className="px-6 py-2 text-sm font-medium transition-all duration-200
                    bg-yellow-400 hover:bg-yellow-300 text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Shop Now
                </Button>
              </Link>
            </div>

            {/* Image Section */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="relative w-full max-w-xs">
                <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}