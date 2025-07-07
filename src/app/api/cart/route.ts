/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartService } from "@/lib/database/cart.service";
import { supabase } from "@/lib/storage/supabase"; // Import supabase client

// Helper function to convert Decimal fields in product to numbers
function formatProductPrices(product: any) {
  if (!product) return product;
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
  };
}

// Helper function to get public URL for an image filename
function getPublicImageUrl(imageName: string): string {
  if (!imageName) return "/placeholder.svg"; // Fallback if no image name
  // Check if it's already a full URL (e.g., if product.images already contains URLs)
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageName);
  return data.publicUrl || "/placeholder.svg"; // Fallback if publicUrl is null
}

// Helper function to format product data including prices and image URLs
function formatProductForClient(product: any) {
  if (!product) return product;

  const formattedProduct = formatProductPrices(product);

  // Map image filenames to public URLs
  const formattedImages = product.images.map((img: string) => getPublicImageUrl(img));

  return {
    ...formattedProduct,
    images: formattedImages,
  };
}


/**
 * GET /api/cart
 * Fetches the current user's shopping cart items.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const cartItems = await CartService.getCartItemsByUserId(session.user.id);
    
    // Format prices AND images for each product within cart items
    const formattedCartItems = cartItems.map(item => ({
      ...item,
      product: formatProductForClient(item.product)
    }));

    return NextResponse.json(formattedCartItems);
  } catch (error) {
    console.error("[API/CART/GET] Error fetching cart items:", error);
    return NextResponse.json(
      { message: "Failed to fetch cart items", error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Adds a product to the current user's cart or updates its quantity.
 * Body: { productId: string, quantity: number }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { productId, quantity } = await request.json();

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid request body: productId and positive quantity are required." },
        { status: 400 }
      );
    }

    const cartItem = await CartService.addItemToCart(
      session.user.id,
      productId,
      quantity
    );
    // Format prices AND images for the product within the newly added/updated cart item
    const formattedCartItem = {
      ...cartItem,
      product: formatProductForClient(cartItem.product)
    };

    return NextResponse.json(formattedCartItem, { status: 200 });
  } catch (error) {
    console.error("[API/CART/POST] Error adding item to cart:", error);
    if ((error as Error).message.includes("stock")) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
    if ((error as Error).message.includes("Product not found")) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to add item to cart", error: (error as Error).message },
      { status: 500 }
    );
  }
}
