// src/app/api/flashSale/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ProductService } from "@/lib/database/product.service";
import { NextRequest } from "next/server"; // Import NextRequest

export async function GET(req: NextRequest) { // Change signature to accept NextRequest
  try {
    const { searchParams } = new URL(req.url); // Get search params from the request URL
    const categoryId = searchParams.get("categoryId"); // Get categoryId from query

    const products = await ProductService.findFlashSaleProducts(categoryId || undefined);

    // Transform product data for client-side consumption
    const transformedProducts = products.map(product => {
      // Calculate remaining time for the countdown
      const now = new Date();
      const saleEnd = product.saleEnd ? new Date(product.saleEnd) : null;
      const timeLeftMs = saleEnd ? saleEnd.getTime() - now.getTime() : 0;

      return {
        ...product,
        price: product.price.toNumber(), // Convert Decimal to number for client
        salePrice: product.salePrice?.toNumber() ?? product.price.toNumber(), // Ensure salePrice is a number or fallback
        timeLeftMs: Math.max(0, timeLeftMs), // Ensure non-negative
      };
    });

    return NextResponse.json({ success: true, data: transformedProducts });
  } catch (error: any) {
    console.error("Error fetching flash sale products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}