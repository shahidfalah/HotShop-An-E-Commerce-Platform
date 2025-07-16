/* eslint-disable react-hooks/exhaustive-deps */
// src/_components/ProductCountdown.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface ProductCountdownProps {
  saleEnd: string | null;
}

const ProductCountdown = ({ saleEnd }: ProductCountdownProps) => {
  const calculateTimeLeft = () => {
    if (!saleEnd) return { hours: 0, minutes: 0, seconds: 0 };
    const difference = +new Date(saleEnd) - +new Date();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [saleEnd]);

  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="text-center">
        <div className="bg-gray-200 rounded-md w-16 h-16 flex items-center justify-center font-bold text-lg text-gray-900">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <span className="text-xs mt-1 text-gray-600">Hours</span>
      </div>
      <div className="text-center">
        <div className="bg-gray-200 rounded-md w-16 h-16 flex items-center justify-center font-bold text-lg text-gray-900">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <span className="text-xs mt-1 text-gray-600">Minutes</span>
      </div>
      <div className="text-center">
        <div className="bg-gray-200 rounded-md w-16 h-16 flex items-center justify-center font-bold text-lg text-gray-900">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <span className="text-xs mt-1 text-gray-600">Seconds</span>
      </div>
    </div>
  );
};

export default ProductCountdown;
