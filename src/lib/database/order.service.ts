// src/lib/database/order.service.ts
import { prisma } from "@/lib/prisma";

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

  // You might have other order-related methods here (e.g., findOrderById, createOrder, updateOrderStatus, etc.)
  // Add them if they exist in your current setup.
}
