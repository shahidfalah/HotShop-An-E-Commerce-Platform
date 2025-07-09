/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/orders/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to convert Decimal fields to numbers for JSON serialization
function formatOrderPrices(order: any) {
  if (!order) return order;
  return {
    ...order,
    total: order.total ? parseFloat(order.total.toString()) : 0,
    payment: order.payment ? {
      ...order.payment,
      amount: order.payment.amount ? parseFloat(order.payment.amount.toString()) : 0,
    } : null,
    orderItems: order.orderItems ? order.orderItems.map((item: any) => ({
      ...item,
      price: item.price ? parseFloat(item.price.toString()) : 0,
      product: item.product ? { // Ensure product prices are also formatted if included
        ...item.product,
        price: item.product.price ? parseFloat(item.product.price.toString()) : 0,
        salePrice: item.product.salePrice ? parseFloat(item.product.salePrice.toString()) : null,
      } : null,
    })) : [],
  };
}

// Helper function to get public URL for an image filename (re-used from cart API)
function getPublicImageUrl(imageName: string): string {
  if (!imageName) return "/placeholder.svg";
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  // Assuming 'supabase' client is available globally or imported from a utility
  // For this API route, we'll need to import it explicitly if not already
  // import { supabase } from "@/lib/storage/supabase"; // Uncomment if needed
  // const { data } = supabase.storage.from("product-images").getPublicUrl(imageName);
  // return data.publicUrl || "/placeholder.svg";
  // For now, returning a placeholder or letting the frontend handle it if the full URL isn't available here
  // If your product images are stored as just filenames in the DB, and you need full URLs here,
  // you'll need to fetch them from Supabase storage here.
  // For consistency with the cart API, let's assume images are full URLs or we convert them.
  // If your product model in Prisma only stores filenames, you need the supabase import.
  // Assuming for now that the product images are coming as full URLs from the DB or are handled elsewhere.
  // If not, you will need to uncomment the supabase import and use the getPublicUrl logic.
  return `/api/images/${imageName}`; // Fallback to your /api/images proxy if needed
}


/**
 * GET /api/orders
 * Fetches all orders for the authenticated user.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: true, // Include product details for each order item
          },
        },
        shippingAddress: true, // Include shipping address details
        billingAddress: true, // Include billing address details
        payment: true, // Include payment details
      },
      orderBy: {
        createdAt: 'desc', // Show most recent orders first
      },
    });

    // Format Decimal fields to numbers and image URLs for client-side consumption
    const formattedOrders = orders.map(order => {
      const formattedOrder = formatOrderPrices(order);
      
      // Also format product images within orderItems
      formattedOrder.orderItems = formattedOrder.orderItems.map((item: any) => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: item.product.images.map((img: string) => getPublicImageUrl(img)),
        } : null,
      }));

      return formattedOrder;
    });

    return NextResponse.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("[API/ORDERS/GET] Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders", error: (error as Error).message },
      { status: 500 }
    );
  }
}
