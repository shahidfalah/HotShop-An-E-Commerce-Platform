// src/app/api/products/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ProductService } from "@/lib/database/product.service";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "@/lib/auth"; // Import authOptions

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions); // Get session
  const userId = session?.user?.id; // Extract userId

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const slug = searchParams.get("slug");
    const limitParam = searchParams.get("limit");

    let products: any[] = [];

    if (slug) {
      // Pass userId to findProductBySlug
      const product = await ProductService.findProductBySlug(slug, userId || undefined);
      if (product) {
        products = [product]; // Wrap the single product in an array for consistent mapping
      } else {
        console.log("API: No product found for slug:", slug);
      }
    } else if (type === "isFlashSale") {
      // Pass userId to findFlashSaleProducts
      products = await ProductService.findFlashSaleProducts(categoryId || undefined, userId || undefined);
    } else if (type === "latest") {
      const limit = parseInt(limitParam || "4", 10);
      // Pass userId to findLatestProducts
      products = await ProductService.findLatestProducts(limit, userId || undefined);
    } else if (type === "discounted") {
      // findAllProducts now accepts userId
      const allActiveProducts = await ProductService.findAllProducts(undefined, userId || undefined); 

      const limit = parseInt(limitParam || "8", 10);

      const productsWithDiscount = allActiveProducts
        .filter(p => p.discountPercentage && p.discountPercentage > 0);

      products = productsWithDiscount
        .sort((a, b) => (b.stock || 0) - (a.stock || 0))
        .slice(0, limit);

    } else if (type === "bestOffer") {
      // findAllProducts now accepts userId
      const allActiveProducts = await ProductService.findAllProducts(undefined, userId || undefined);

      const productsWithDiscount = allActiveProducts
        .filter(p => p.discountPercentage && p.discountPercentage > 0);

      products = productsWithDiscount
        .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
        .slice(0, 1);

    } else {
      // Default behavior: Fetch all active products (for the new /products page)
      // Pass userId to findAllProducts
      products = await ProductService.findAllProducts(categoryId || undefined, userId || undefined);
    }

    // For single product requests (by slug), return the single product directly, not an array
    if (slug) {
      return NextResponse.json({ success: true, data: products[0] || null });
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("API: Uncaught Error fetching products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
