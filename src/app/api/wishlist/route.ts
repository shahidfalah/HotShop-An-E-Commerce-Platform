/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/wishlist/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WishlistService } from "@/lib/database/wishlist.service"; // Import your new service
import { supabase } from "@/lib/storage/supabase"; // Import supabase client for image URLs
import { prisma } from "@/lib/prisma";

// Helper function to get public URL for an image filename (re-used)
function getPublicImageUrl(imageName: string): string {
  if (!imageName) return "/placeholder.svg";
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageName);
  return data.publicUrl || "/placeholder.svg";
}

// Helper function to convert Decimal fields to numbers for JSON serialization
function formatProductPrices(product: any) {
  if (!product) return product;
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
  };
}

// Helper function to format product data including prices and image URLs
function formatProductForClient(product: any) {
  if (!product) return product;

  const formattedProduct = formatProductPrices(product);

  const formattedImages = Array.isArray(product.images)
    ? product.images.map((img: string) => getPublicImageUrl(img))
    : [];

  return {
    ...formattedProduct,
    images: formattedImages,
  };
}

/**
 * GET /api/wishlist
 * Fetches all wishlist items for the authenticated user.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const wishlistItems = await WishlistService.getWishlistItems(session.user.id);
    
    // Format product data (prices and image URLs) for client
    const formattedWishlistItems = wishlistItems.map(item => ({
      ...item,
      product: formatProductForClient(item.product)
    }));

    return NextResponse.json({ success: true, data: formattedWishlistItems });
  } catch (error) {
    console.error("[API/WISHLIST/GET] Error fetching wishlist:", error);
    return NextResponse.json(
      { message: "Failed to fetch wishlist", error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Adds a product to the user's wishlist.
 * Body: { productId: string }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    const wishlistItem = await WishlistService.addToWishlist(session.user.id, productId);
    
    // Fetch the product details to return a complete item, including formatted images/prices
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const formattedProduct = product ? formatProductForClient(product) : null;

    return NextResponse.json({ success: true, message: "Product added to wishlist.", data: { ...wishlistItem, product: formattedProduct } }, { status: 200 });
  } catch (error) {
    console.error("[API/WISHLIST/POST] Error adding to wishlist:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to add product to wishlist." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist
 * Removes a product from the user's wishlist.
 * Body: { productId: string }
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { productId } = await request.json(); // Use request.json() for DELETE with body

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    await WishlistService.removeFromWishlist(session.user.id, productId);

    return NextResponse.json({ success: true, message: "Product removed from wishlist." }, { status: 200 });
  } catch (error) {
    console.error("[API/WISHLIST/DELETE] Error removing from wishlist:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to remove product from wishlist." },
      { status: 500 }
    );
  }
}
