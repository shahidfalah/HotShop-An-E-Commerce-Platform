// src/app/api/products/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ProductService } from "@/lib/database/product.service";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/storage/supabase"; // Import Supabase for image URL generation
// import { prisma } from "@/lib/prisma"; // Assuming your Prisma client is exported here

export async function GET(req: NextRequest) {
  
  // if(prisma) return NextResponse.json({ success: false, error: "server error" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const slug = searchParams.get("slug"); // Get the slug parameter
    const limitParam = searchParams.get("limit");

    let products: any[] = []; // Initialize as an empty array to ensure consistency

    console.log("==============================API: Request received.");
    console.log("API: Type:", type);
    console.log("API: Slug:", slug);

    if (slug) { // If a slug is provided, fetch a single product by slug
      console.log(`API: Fetching single product by slug: ${slug}`);
      const product = await ProductService.findProductBySlug(slug);
      if (product) {
        products = [product]; // Wrap the single product in an array for consistent mapping
        console.log("API: Found product by slug:", product.title);
      } else {
        console.log("API: No product found for slug:", slug);
      }
    } else if (type === "products") { // Fixed typo: removed trailing space
      products = await ProductService.findFlashSaleProducts(categoryId || undefined);
      console.log("API: Fetched Flash Sale Products (type=isFlashSale):", products.length);
    } else if (type === "latest") {
      const limit = parseInt(limitParam || "4", 10);
      products = await ProductService.findLatestProducts(limit);
      console.log("API: Fetched Latest Products (type=latest):", products.length);
    } else if (type === "discounted") {
      console.log("API: Processing request for 'discounted' products...");
      const allActiveProducts = await ProductService.findAllProducts();
      console.log("API: Total active products from findAllProducts():", allActiveProducts.length);

      const limit = parseInt(limitParam || "8", 10); // Default to 8 if limit not provided

      const productsWithDiscount = allActiveProducts
        .map(product => {
          const originalPrice = product.price ? product.price.toNumber() : 0;
          const salePrice = product.salePrice ? product.salePrice.toNumber() : null;

          let discountPercentage = 0;
          if (salePrice !== null && salePrice < originalPrice && originalPrice > 0) {
            discountPercentage = ((originalPrice - salePrice) / originalPrice) * 100;
          }
          return { ...product, discountPercentage: parseFloat(discountPercentage.toFixed(2)) };
        })
        .filter(p => p.discountPercentage && p.discountPercentage > 0); // Filter for actual positive discounts

      console.log("API: Products with calculated positive discounts:", productsWithDiscount.length);

      products = productsWithDiscount
        .sort((a, b) => (b.stock || 0) - (a.stock || 0)) // CHANGED: Sort by stock from bigger to smaller
        .slice(0, limit); // Take the top N products
      console.log(`API: Final 'discounted' products (top ${limit}):`, products.length);

    } else if (type === "bestOffer") {
      console.log("API: Processing request for 'bestOffer' product...");
      const allActiveProducts = await ProductService.findAllProducts();
      console.log("API: Total active products for bestOffer calc:", allActiveProducts.length);

      const productsWithDiscount = allActiveProducts
        .map(product => {
          const originalPrice = product.price ? product.price.toNumber() : 0;
          const salePrice = product.salePrice ? product.salePrice.toNumber() : null;

          let discountPercentage = 0;
          if (salePrice !== null && salePrice < originalPrice && originalPrice > 0) {
            discountPercentage = ((originalPrice - salePrice) / originalPrice) * 100;
          }
          return { ...product, discountPercentage: parseFloat(discountPercentage.toFixed(2)) };
        })
        .filter(p => p.discountPercentage && p.discountPercentage > 0);

      console.log("API: Products with calculated positive discounts for bestOffer:", productsWithDiscount.length);

      products = productsWithDiscount
        .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
        .slice(0, 1);
      console.log("API: Final 'bestOffer' product (count):", products.length);

    } else {
      products = await ProductService.findAllProducts(categoryId || undefined);
      console.log("API: Fetched All Products (default type):", products.length);
    }

    console.log("==============================API: Products before transformation (count):", products.length);

    // --- Image URL Transformation and Final Product Mapping ---
    const transformedProducts = products.map(product => {
      const now = new Date();
      const saleEnd = product.saleEnd ? new Date(product.saleEnd) : null;
      const timeLeftMs = saleEnd ? saleEnd.getTime() - now.getTime() : null;

      const publicImageUrls = product.images.map((imageSource: string) => {
        if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
          return imageSource;
        }
        const { data } = supabase.storage.from("product-images").getPublicUrl(imageSource);
        return data.publicUrl;
      }).filter((url: string | null) => url !== null) as string[];

      // Recalculate discountPercentage correctly here based on price and salePrice
      const originalPrice = product.price ? product.price.toNumber() : 0;
      const salePrice = product.salePrice ? product.salePrice.toNumber() : null;
      let calculatedDiscountPercentage: number | null = null;
      if (salePrice !== null && salePrice < originalPrice && originalPrice > 0) {
        calculatedDiscountPercentage = parseFloat(((originalPrice - salePrice) / originalPrice * 100).toFixed(2));
      }

      return {
        ...product,
        price: originalPrice, // Ensure price is a number
        salePrice: salePrice, // Ensure salePrice is a number or null
        timeLeftMs: timeLeftMs !== null ? Math.max(0, timeLeftMs) : null,
        discountPercentage: calculatedDiscountPercentage, // Corrected assignment
        images: publicImageUrls,
        itemsSold: product.itemsSold ?? null,
        itemLimit: product.itemLimit ?? null,
      };
    });

    console.log("==============================API: Transformed Products (count):", transformedProducts.length);

    // For single product requests (by slug), return the single product directly, not an array
    if (slug) {
      return NextResponse.json({ success: true, data: transformedProducts[0] || null });
    }

    return NextResponse.json({ success: true, data: transformedProducts });
  } catch (error: any) {
    console.error("API: Uncaught Error fetching products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
