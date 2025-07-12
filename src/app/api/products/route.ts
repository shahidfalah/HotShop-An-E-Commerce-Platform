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
      const product = await ProductService.findProductBySlug(slug, userId || undefined);
      if (product) {
        products = [product]; // Wrap the single product in an array for consistent mapping
      } else {
        console.log("API: No product found for slug:", slug);
      }
    } else if (type === "isFlashSale") { // Corrected: "isFlashSale" without trailing space
      // console.log("API: Fetching Flash Sale Products...");
      products = await ProductService.findFlashSaleProducts(categoryId || undefined);
      // console.log("API: Fetched Flash Sale Products (type=isFlashSale):", products.length);
    } else if (type === "latest") {
      // console.log("API: Fetching Latest Products...");
      const limit = parseInt(limitParam || "4", 10);
      products = await ProductService.findLatestProducts(limit);
      // console.log("API: Fetched Latest Products (type=latest):", products.length);
    } else if (type === "discounted") {
      // console.log("API: Processing request for 'discounted' products...");
      const allActiveProducts = await ProductService.findAllProducts(); // findAllProducts now returns formatted products
      // console.log("API: Total active products from findAllProducts() for discounted calc:", allActiveProducts.length);

      const limit = parseInt(limitParam || "8", 10);

      const productsWithDiscount = allActiveProducts
        .filter(p => p.discountPercentage && p.discountPercentage > 0); // Filter for actual positive discounts

      // console.log("API: Products with calculated positive discounts:", productsWithDiscount.length);

      products = productsWithDiscount
        .sort((a, b) => (b.stock || 0) - (a.stock || 0)) // Sort by stock from biggest to smallest
        .slice(0, limit);
      // console.log(`API: Final 'discounted' products (top ${limit}):`, products.length);

    } else if (type === "bestOffer") {
      // console.log("API: Processing request for 'bestOffer' product...");
      const allActiveProducts = await ProductService.findAllProducts(); // findAllProducts now returns formatted products
      // console.log("API: Total active products for bestOffer calc:", allActiveProducts.length);

      const productsWithDiscount = allActiveProducts
        .filter(p => p.discountPercentage && p.discountPercentage > 0);

      // console.log("API: Products with calculated positive discounts for bestOffer:", productsWithDiscount.length);

      products = productsWithDiscount
        .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
        .slice(0, 1);
      // console.log("API: Final 'bestOffer' product (count):", products.length);

    } else {
      // Default behavior: Fetch all active products (for the new /products page)
      // console.log("API: No specific type or slug. Fetching all active products.");
      products = await ProductService.findAllProducts(categoryId || undefined); // findAllProducts now returns formatted products
      // console.log("API: Fetched All Active Products (default behavior):", products.length);
    }

    // console.log("==============================API: Products ready to be sent (count):", products.length);

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
