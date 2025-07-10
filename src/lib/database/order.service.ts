/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/order.service.ts
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma"; // Import OrderStatus enum

// Helper function to convert Decimal fields in product to numbers
function formatProductPrices(product: any) {
  if (!product) return product;
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
  };
}

// Helper function to format order items, including product prices
function formatOrderItemForClient(item: any) {
  if (!item) return item;
  return {
    ...item,
    price: item.price ? parseFloat(item.price.toString()) : 0, // Convert order item price
    product: formatProductPrices(item.product), // Recursively format product prices
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
   * Converts Decimal types to numbers for client-side compatibility.
   * @param userId The ID of the user.
   * @returns An array of order objects with prices as numbers, regardless of status.
   */
  static async getAllUserOrdersWithProducts(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
          // No status filter here, fetches all orders
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: true,
                  price: true,     // Include original price
                  salePrice: true, // Include sale price
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Order by most recent order first
        },
      });
      // Format the fetched orders to convert Decimal to number
      return orders.map(formatOrderForClient);
    } catch (error) {
      console.error("Error fetching all user orders with products:", error);
      throw new Error("Failed to retrieve all user orders.");
    }
  }

  /**
   * Retrieves only delivered orders for a specific user, including order items and product details.
   * This method is kept for specific needs where only delivered orders are required.
   * Converts Decimal types to numbers for client-side compatibility.
   * @param userId The ID of the user.
   * @returns An array of delivered order objects with prices as numbers.
   */
  static async getDeliveredOrdersWithProducts(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
          status: "DELIVERED", // Only fetch delivered orders
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: true,
                  price: true,     // Include original price
                  salePrice: true, // Include sale price
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Order by most recent order first
        },
      });
      // Format the fetched orders to convert Decimal to number
      return orders.map(formatOrderForClient);
    } catch (error) {
      console.error("Error fetching delivered orders with products:", error);
      throw new Error("Failed to retrieve delivered orders.");
    }
  }

  /**
   * Updates the status of a specific order.
   * This method would typically be called by an admin panel or a webhook.
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
