/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/products/[slug]/page.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/_components/ui/button';
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle, Heart } from 'lucide-react'; // Import Heart icon
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

import ProductCountdown from '@/_components/ProductCountdown';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice?: number | null;
  saleStart?: string | null;
  saleEnd?: string | null;
  isFlashSale?: boolean;
  itemsSold?: number | null;
  itemLimit?: number | null;
  discountPercentage?: number | null;
  images: string[];
  brand?: string | null;
  width?: string | null;
  height?: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  isWishlistedByUser?: boolean; // NEW: Indicates if the current user has wishlisted this product
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${baseUrl}/api/products?slug=${slug}`; // This API needs to return isWishlistedByUser
    const res = await fetch(url, {
      cache: 'no-store',
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

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { slug } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // NEW: Wishlist state for this specific product
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoadingProduct(true);
      setErrorProduct(null);
      try {
        const fetchedProduct = await getProductBySlug(slug);
        setProduct(fetchedProduct);
        if (fetchedProduct) {
          setIsWishlisted(fetchedProduct.isWishlistedByUser || false); // Initialize wishlist state
        } else {
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
  }, [slug]);

  // NEW: Function to toggle wishlist status
  const toggleWishlist = async () => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setAddToCartMessage({ type: 'error', text: 'Please log in to manage your wishlist.' });
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const response = await fetch("/api/wishlist", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product?.id }), // Use product?.id
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to update wishlist.");
      }

      setIsWishlisted(prev => !prev);
      setAddToCartMessage({ type: 'success', text: isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!' });
      router.refresh();

    } catch (err: any) {
      console.error("Error toggling wishlist from detail page:", err);
      setAddToCartMessage({ type: 'error', text: err.message || "An error occurred." });
    } finally {
      setTimeout(() => setAddToCartMessage(null), 3000);
    }
  };


  const handleAddToCart = async () => {
    setAddToCartMessage(null);
    setIsAddingToCart(true);

    if (status === "unauthenticated") {
      setAddToCartMessage({ type: 'error', text: 'Please log in to add items to your cart.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    if (!product || product.stock === 0) {
      setAddToCartMessage({ type: 'error', text: 'This product is out of stock or unavailable.' });
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
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
      router.refresh();

    } catch (err: any) {
      console.error("Error adding to cart from product detail:", err);
      setAddToCartMessage({ type: 'error', text: err.message || "An unexpected error occurred." });
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setAddToCartMessage(null), 3000);
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

  if (!product) {
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
            <div className="flex space-x-4 items-center">
              <Link href="/products">
                <Button variant="outline" className="px-6 py-3 border-none text-(--color-font) bg-(#E0E0E0) hover:bg-(#bdbdbd)">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
              </Link>
              <Button
                onClick={handleAddToCart}
                className="px-8 py-3 bg-(--color-primary) text-white hover:bg-(--color-primary-hover) shadow-md"
                disabled={isAddingToCart || product.stock === 0}
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
              {/* NEW: Wishlist Button for Product Detail Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleWishlist}
                className={`w-12 h-12 rounded-full border-none shadow-md ${
                  isWishlisted ? "bg-(--color-primary) text-white" : "bg-gray-100 text-gray-600"
                } hover:bg-(--color-primary) hover:text-white transition-colors duration-200`}
                disabled={status === "loading"}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-white" : "fill-none"}`} />
              </Button>
            </div>
            
            {/* Add to Cart/Wishlist Message */}
            {addToCartMessage && (
              <div className={`mt-4 p-3 text-sm rounded-md flex items-center gap-2 ${
                addToCartMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {addToCartMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span>{addToCartMessage.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
