// src/app/products/[slug]/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/_components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import the ProductCountdown Client Component
import ProductCountdown from '@/_components/ProductCountdown';

// Define a comprehensive Product interface for this page
interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice?: number | null;
  saleStart?: string | null; // ISO string
  saleEnd?: string | null;    // ISO string
  isFlashSale?: boolean;
  itemsSold?: number | null; // Keeping in interface for API consistency, but not displayed
  itemLimit?: number | null; // Keeping in interface for API consistency, but not displayed
  discountPercentage?: number | null;
  images: string[]; // Array of full image URLs
  brand?: string | null;
  width?: string | null;
  height?: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdById: string;
  categoryId: string;
  rating?: number | null;
  category?: {
    id: string;
    title: string;
    slug: string;
  };
  _count?: {
    reviews: number;
    wishlists: number;
  };
}

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/products?slug=${slug}`;
    const res = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error(`Server-side fetch error for product slug '${slug}':`, errorData.error);
      return null;
    }

    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch product with slug '${slug}' server-side:`, error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-lg">Product not found.</p>
      </div>
    );
  }

  const categoryTitle = product.category?.title || "Category";
  const categorySlug = product.category?.slug || '#';

  return (
    <div className="min-h-screen bg-[--color-background] text-gray-900"> {/* Corrected Tailwind syntax */}
      <div className="container mx-auto py-8 px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          {/* Updated breadcrumb to link to /products */}
          <Link href="/products" className="hover:underline">Products</Link> /{" "}
          <Link href={`/categories/${categorySlug}`} className="hover:underline">{categoryTitle}</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="flex flex-col items-center">
            {/* Main Product Image */}
            <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-lg mb-4">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((imgSrc, index) => (
                <div key={index} className="relative w-20 h-20 flex-none rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:border-[--color-primary]">
                  <Image
                    src={imgSrc || "/placeholder.svg"}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600 text-sm mb-4">Brand: {product.brand || 'N/A'}</p>
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            <div className="text-gray-600 text-sm mb-4">
              <p>Width: {product.width || 'N/A'}</p>
              <p>Height: {product.height || 'N/A'}</p>
            </div>

            {/* Flash Sale Section */}
            {product.isFlashSale && product.salePrice && product.salePrice < product.price && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Flash Sale</h3>
                <p className="text-gray-500 line-through">Original Price: ${product.price.toFixed(2)}</p>
                <p className="text-2xl font-bold text-(--color-primary)">Discounted Price: ${product.salePrice.toFixed(2)}</p> {/* Corrected Tailwind syntax */}
              </div>
            )}

            {/* Flash Sale Ends In / Countdown */}
            {product.isFlashSale && product.saleEnd && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Flash Sale Ends In</h3>
                <ProductCountdown saleEnd={product.saleEnd} />
              </div>
            )}

            {/* Additional Info Boxes */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="font-bold text-lg text-gray-900">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                <span className="text-sm text-gray-600">Availability</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="font-bold text-lg text-gray-900">{product.discountPercentage ? `${product.discountPercentage}%` : 'N/A'}</p>
                <span className="text-sm text-gray-600">Discount</span>
              </div>
              {/* Removed the "Items Left" box as per your decision */}
              {/* Keeping the grid-cols-3 for now, but you might adjust to grid-cols-2 or add another info box */}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {/* Updated "Go Back" link to /products */}
              <Link href="/products">
                <Button variant="outline" className="px-6 py-3 border-none text-[--color-font] bg-[#E0E0E0] hover:bg-[#bdbdbd]"> {/* Corrected Tailwind syntax */}
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
              </Link>
              <Button className="px-8 py-3 bg-(--color-primary) text-white hover:bg-(--color-primary-hover) shadow-md"> {/* Corrected Tailwind syntax */}
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
