/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/products/[slug]/page.tsx
"use client"; // Convert to Client Component for interactivity

import React, { useState } from 'react'; // Import useState
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/_components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react'; // Import ShoppingCart, CheckCircle, XCircle
import { useSession } from 'next-auth/react'; // Import useSession for authentication check
import { useRouter, useParams } from 'next/navigation'; // Import useRouter and useParams for page refresh and params access

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

// interface ProductDetailPageProps {
//   params: {
//     slug: string;
//   };
// }

// getProductBySlug remains an async function, but it's now called within a Client Component.
// For Next.js App Router, fetching data in a Client Component's useEffect is common,
// or passing initial data from a Server Component parent.
// For this example, we'll keep the fetch function separate and call it directly.
// In a real app, you might use SWR or React Query for client-side fetching.
async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Ensure NEXT_PUBLIC_APP_URL is correctly set in your .env.local for client-side fetches
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${baseUrl}/api/products?slug=${slug}`;
    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for product details
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error(`Client-side fetch error for product slug '${slug}':`, errorData.error);
      return null;
    }

    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch product with slug '${slug}' client-side:`, error);
    return null;
  }
}

export default function ProductDetailPage() { // Removed params from props, will use useParams
  const params = useParams<{ slug: string }>(); // Use useParams hook
  const { slug } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [, setAddToCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { status } = useSession();
  const router = useRouter();

  // Fetch product data on component mount
  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoadingProduct(true);
      setErrorProduct(null);
      try {
        const fetchedProduct = await getProductBySlug(slug);
        setProduct(fetchedProduct);
        if (!fetchedProduct) {
          setErrorProduct("Product not found.");
        }
      } catch (err: any) {
        setErrorProduct(err.message || "Failed to load product details.");
        console.error("Error fetching product in client component:", err);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [slug]); // Re-fetch if slug changes

  const handleAddToCart = async () => {
    setAddToCartMessage(null); // Clear previous messages
    setIsAddingToCart(true);

    if (status === "unauthenticated") {
      setAddToCartMessage({ type: 'error', text: 'Please log in to add items to your cart.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000); // Clear message after 3 seconds
      return;
    }

    if (!product || product.stock === 0) {
      setAddToCartMessage({ type: 'error', text: 'This product is out of stock or unavailable.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000); // Clear message after 3 seconds
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }), // Add 1 item by default
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error("Non-JSON response from /api/cart:", errorText);
        throw new Error(`Server responded with non-JSON content (Status: ${response.status}). Check server logs for details.`);
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to add product to cart.");
      }

      setAddToCartMessage({ type: 'success', text: `${product.title} added to cart!` });
      router.refresh(); // Trigger a re-fetch of session data (which includes cart count in header)

    } catch (err: any) {
      console.error("Error adding to cart from product detail:", err);
      setAddToCartMessage({ type: 'error', text: err.message || "An unexpected error occurred." });
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000); // Clear message after 3 seconds
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <p className="text-gray-600 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (errorProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <p className="text-red-600 text-lg">{errorProduct}</p>
      </div>
    );
  }

  if (!product) { // Should be caught by errorProduct, but good for type safety
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <p className="text-gray-600 text-lg">Product not found.</p>
      </div>
    );
  }

  const categoryTitle = product.category?.title || "Category";
  const categorySlug = product.category?.slug || '#';

  return (
    <div className="min-h-screen bg-(--color-background) text-gray-900">
      <div className="container mx-auto py-8 px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
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
                <div key={index} className="relative w-20 h-20 flex-none rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:border-(--color-primary)">
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
                <p className="text-2xl font-bold text-(--color-primary)">Discounted Price: ${product.salePrice.toFixed(2)}</p>
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
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 items-center"> {/* Added items-center for vertical alignment */}
              <Link href="/products">
                <Button variant="outline" className="px-6 py-3 border-none text-(--color-font) bg-(#E0E0E0) hover:bg-(#bdbdbd)">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
              </Link>
              <Button
                onClick={handleAddToCart}
                className="px-8 py-3 bg-(--color-primary) text-white hover:bg-(--color-primary-hover) shadow-md"
                disabled={isAddingToCart || product.stock === 0} // Disable if adding or out of stock
              >
                {isAddingToCart ? (
                  "Adding..."
                ) : product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                  </>
                )}
              </Button>
            </div>
            
            {/* Add to Cart Message */}
            {/* {addToCartMessage && (
              <div className={`mt-4 p-3 text-sm rounded-md flex items-center gap-2 ${
                addToCartMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {addToCartMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span>{addToCartMessage.text}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
