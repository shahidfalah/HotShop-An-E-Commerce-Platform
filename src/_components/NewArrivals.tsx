// src/_components/NewArrivals.tsx
"use client";

import React from "react";
import { SprayCan } from "lucide-react";
import { Button } from "@/_components/ui/button";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation
import { Product } from "./BestDiscounts"; // Import Product interface for type consistency

export default function NewArrivals({ initialProducts }: { initialProducts: Product[] }) {
  // Use the initialProducts prop directly
  const products = initialProducts;

  // Destructure the first product as main and the rest as other products
  // Ensure robust handling if products array is empty or has fewer than 4 items
  const mainProduct = products[0];
  const otherProducts = products.slice(1);

  // Fallback data for display if no products are fetched or not enough
  const defaultPlaceholderProducts = [
    {
      id: "placeholder-1",
      title: "Placeholder Main Product",
      description: "Discover our newest collection of items.",
      images: ["/placeholder.svg"],
      slug: "#",
    },
    {
      id: "placeholder-2",
      title: "Placeholder Item 1",
      description: "Explore unique finds.",
      images: ["/placeholder.svg?height=300&width=300"],
      slug: "#",
    },
    {
      id: "placeholder-3",
      title: "Placeholder Item 2",
      description: "Great new additions.",
      images: ["/placeholder.svg?height=200&width=200"],
      slug: "#",
    },
    {
      id: "placeholder-4",
      title: "Placeholder Item 3",
      description: "Something for everyone.",
      images: ["/placeholder.svg?height=200&width=200"],
      slug: "#",
    },
  ];

  // Helper to get product details safely, with fallbacks
  const getProductDetail = (product: Product | undefined, key: keyof Product | 'images', defaultValue: string | number | null = '') => {
    if (!product) {
      // Return specific default for image, otherwise generic
      if (key === 'images') {
        return "/placeholder.svg"; // Generic image fallback
      }
      return defaultValue;
    }
    // Handle images array for the 'image' key
    if (key === 'images' && product.images && product.images.length > 0) {
      return product.images[0];
    }
    
    if (key === 'description' || key === 'title' || key === 'slug') return product[key];
    else return defaultValue;
  };
  
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
            <Link href={`/products/${getProductDetail(mainProduct, 'slug', defaultPlaceholderProducts[0].slug)}`} className="block h-full">
              <div className="p-8 lg:p-12 h-full flex flex-col justify-end relative z-10">
                <div className="mb-4">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2">{getProductDetail(mainProduct, 'title', defaultPlaceholderProducts[0].title)}</h3>
                  <p className="text-gray-300 mb-4">{getProductDetail(mainProduct, 'description', defaultPlaceholderProducts[0].description)}</p>
                  <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                    Shop Now
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0">
                <Image
                  src={getProductDetail(mainProduct, 'images', defaultPlaceholderProducts[0].images[0]) as string}
                  alt={getProductDetail(mainProduct, 'title', defaultPlaceholderProducts[0].title) as string}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Secondary Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Map over otherProducts for dynamic rendering, up to 3 items */}
            {otherProducts.slice(0, 3).map((product, index) => (
              <div
                key={product.id || `other-product-${index}`}
                className={`rounded-lg overflow-hidden text-white relative group ${
                  index === 2 ? 'sm:col-span-2 bg-gradient-to-br from-amber-600 to-amber-800' : (index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800')
                }`}
              >
                <Link href={`/products/${getProductDetail(product, 'slug', defaultPlaceholderProducts[index + 1].slug)}`} className="block h-full">
                  <div className="p-6 h-full flex flex-col justify-end relative z-10">
                    <h3 className="text-xl font-bold mb-2">{getProductDetail(product, 'title', defaultPlaceholderProducts[index + 1].title)}</h3>
                    <p className="text-gray-300 text-sm mb-4">{getProductDetail(product, 'description', defaultPlaceholderProducts[index + 1].description)}</p>
                    <Button
                      size="sm"
                      className={`bg-transparent border border-white text-white hover:bg-white transition-all duration-300 w-fit ${
                        index === 2 ? 'hover:text-amber-800' : 'hover:text-black'
                      }`}
                    >
                      Shop Now
                    </Button>
                  </div>
                  <div className="absolute inset-0">
                    <Image
                      src={getProductDetail(product, 'images', defaultPlaceholderProducts[index + 1].images[0]) as string}
                      alt={getProductDetail(product, 'title', defaultPlaceholderProducts[index + 1].title) as string}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </Link>
              </div>
            ))}
            {/* Render placeholder products if initialProducts has fewer than 4 items */}
            {products.length < 4 && defaultPlaceholderProducts.slice(products.length).map((product, index) => {
                // Adjust index for defaultPlaceholderProducts based on how many real products are missing
                const defaultProductIndex = products.length + index;
                return (
                    <div
                        key={product.id}
                        className={`rounded-lg overflow-hidden text-white relative group ${
                            defaultProductIndex === 3 ? 'sm:col-span-2 bg-gradient-to-br from-amber-600 to-amber-800' : (defaultProductIndex % 2 === 1 ? 'bg-gray-900' : 'bg-gray-800')
                        }`}
                    >
                        <Link href={`/products/${product.slug}`} className="block h-full">
                            <div className="p-6 h-full flex flex-col justify-end relative z-10">
                                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                                <p className="text-gray-300 text-sm mb-4">{product.description}</p>
                                <Button
                                    size="sm"
                                    className={`bg-transparent border border-white text-white hover:bg-white transition-all duration-300 w-fit ${
                                        defaultProductIndex === 3 ? 'hover:text-amber-800' : 'hover:text-black'
                                    }`}
                                >
                                    Shop Now
                                </Button>
                            </div>
                            <div className="absolute inset-0">
                                <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                        </Link>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
