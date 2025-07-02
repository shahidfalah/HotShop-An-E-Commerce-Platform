// src/app/api/products/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ProductService } from "@/lib/database/product.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const isFlashSale = searchParams.get("isFlashSale"); // New param for filtering
    const latest = searchParams.get("latest"); // New param for latest products

    let products;

    if (isFlashSale === "true") {
      // If specifically asking for flash sales
      products = await ProductService.findFlashSaleProducts(categoryId || undefined);
    } else if (latest === "true") {
      // If specifically asking for latest products
      const limit = parseInt(searchParams.get("limit") || "4", 10);
      products = await ProductService.findLatestProducts(limit);
    }
    else {
      // Default: Find all active products, optionally by category
      products = await ProductService.findAllProducts(categoryId || undefined); // New service method needed
    }

    // Transform product data for client-side consumption (same as before)
    const transformedProducts = products.map(product => {
      const now = new Date();
      const saleEnd = product.saleEnd ? new Date(product.saleEnd) : null;
      const timeLeftMs = saleEnd ? saleEnd.getTime() - now.getTime() : null; // Allow null here
      const originalPrice = product.price.toNumber();
      const currentPrice = product.salePrice?.toNumber() ?? originalPrice;

      return {
        ...product,
        price: originalPrice,
        salePrice: product.salePrice?.toNumber() ?? null, // Ensure salePrice is null if not present
        timeLeftMs: timeLeftMs !== null ? Math.max(0, timeLeftMs) : null, // Ensure non-negative or null
        // Add discountPercentage if it's not already on the product object
        discountPercentage: product.discountPercentage ?? (product.salePrice && originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null),
        itemsSold: product.itemsSold ?? null,
        itemLimit: product.itemLimit ?? null,
      };
    });

    return NextResponse.json({ success: true, data: transformedProducts });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}