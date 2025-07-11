/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/order.service.ts
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma"; // Import OrderStatus enum
import { supabase } from "@/lib/storage/supabase"; // Import supabase client

// Helper function to get public URL for an image filename
function getPublicImageUrl(imageName: string): string {
  if (!imageName) return `https://placehold.co/80x80/E0E0E0/0D171C?text=No+Image`; // Robust fallback
  // If the image name is already a full URL (e.g., from external source), use it directly
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  // Otherwise, get the public URL from Supabase storage
  const { data } = supabase.storage.from("product-images").getPublicUrl(imageName);
  return data.publicUrl || `https://placehold.co/80x80/E0E0E0/0D171C?text=No+Image`; // Robust fallback
}

// Helper function to convert Decimal fields in product to numbers
function formatProductPrices(product: any) {
  if (!product) return product;
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
  };
}

// Helper function to format product data, including prices and image URLs
function formatProductForClient(product: any) {
  if (!product) return product;

  const formattedProduct = formatProductPrices(product);

  // CRITICAL FIX: Transform image filenames to full public URLs here
  const formattedImages = Array.isArray(product.images)
    ? product.images.map((img: string) => getPublicImageUrl(img))
    : [];

  return {
    ...formattedProduct,
    images: formattedImages, // Now contains full public URLs
  };
}

// Helper function to format order items, including product prices and image URLs
function formatOrderItemForClient(item: any) {
  if (!item) return item;
  return {
    ...item,
    price: item.price ? parseFloat(item.price.toString()) : 0, // Convert order item price
    product: formatProductForClient(item.product), // Recursively format product prices AND images
  };
}

// Helper function to format entire order, including total and order items
function formatOrderForClient(order: any) {
  if (!order) return order;
  return {
    ...order,
    total: order.total ? parseFloat(order.total.toString()) : 0, // Convert order total
    orderItems: order.orderItems.map(formatOrderItemForClient), // Map and format each order item
  };
}

export class OrderService {
  /**
   * Counts all orders in the database.
   * @returns The total count of orders.
   */
  static async countAllOrders(): Promise<number> {
    return await prisma.order.count();
  }

  /**
   * Counts orders for a specific user.
   * @param userId The ID of the user.
   * @returns The total count of orders for the user.
   */
  static async countOrdersByUserId(userId: string): Promise<number> {
    return await prisma.order.count({
      where: { userId: userId },
    });
  }

  /**
   * Calculates the total revenue from all completed orders.
   * @returns The total revenue as a number, or 0 if no completed orders.
   */
  static async getTotalRevenue(): Promise<number> {
    const result = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "DELIVERED", // Assuming 'DELIVERED' orders contribute to final revenue
      },
    });

    // Return the total revenue, or 0 if no completed orders
    return result._sum.total ? result._sum.total.toNumber() : 0;
  }

  /**
   * Retrieves all orders for a specific user, including order items and product details.
   * Converts Decimal types to numbers and image filenames to full URLs for client-side compatibility.
   * @param userId The ID of the user.
   * @returns An array of order objects with prices as numbers and image URLs.
   */
  static async getAllUserOrdersWithProducts(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: true, // Select images (filenames)
                  price: true,
                  salePrice: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      // Format the fetched orders to convert Decimal to number AND image filenames to URLs
      return orders.map(formatOrderForClient);
    } catch (error) {
      console.error("Error fetching all user orders with products:", error);
      throw new Error("Failed to retrieve all user orders.");
    }
  }

  /**
   * Retrieves only delivered orders for a specific user, including order items and product details.
   * Converts Decimal types to numbers and image filenames to full URLs for client-side compatibility.
   * @param userId The ID of the user.
   * @returns An array of delivered order objects with prices as numbers and image URLs.
   */
  static async getDeliveredOrdersWithProducts(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
          status: "DELIVERED",
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: true, // Select images (filenames)
                  price: true,
                  salePrice: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      // Format the fetched orders to convert Decimal to number AND image filenames to URLs
      return orders.map(formatOrderForClient);
    } catch (error) {
      console.error("Error fetching delivered orders with products:", error);
      throw new Error("Failed to retrieve delivered orders.");
    }
  }

  /**
   * Updates the status of a specific order.
   * @param orderId The ID of the order to update.
   * @param newStatus The new status to set for the order.
   * @returns The updated order.
   */
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
      return updatedOrder;
    } catch (error) {
      console.error(`Error updating order status for order ${orderId} to ${newStatus}:`, error);
      throw new Error(`Failed to update order status: ${(error as Error).message}`);
    }
  }
}
