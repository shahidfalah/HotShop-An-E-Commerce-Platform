/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/wishlist.service.ts
import { prisma } from "@/lib/prisma";

export class WishlistService {
  /**
   * Adds a product to a user's wishlist.
   * If the product is already in the wishlist, it does nothing.
   * @param userId The ID of the user.
   * @param productId The ID of the product to add.
   * @returns The created or existing Wishlist item.
   */
  static async addToWishlist(userId: string, productId: string) {
    try {
      const existingWishlistItem = await prisma.wishlist.findUnique({
        where: {
          userId_productId: { // Unique constraint on (userId, productId)
            userId,
            productId,
          },
        },
      });

      if (existingWishlistItem) {
        // Product is already in wishlist, return it
        return existingWishlistItem;
      }

      const wishlistItem = await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });
      return wishlistItem;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw new Error("Failed to add product to wishlist.");
    }
  }

  /**
   * Removes a product from a user's wishlist.
   * @param userId The ID of the user.
   * @param productId The ID of the product to remove.
   * @returns The deleted Wishlist item.
   */
  static async removeFromWishlist(userId: string, productId: string) {
    try {
      const deletedItem = await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      return deletedItem;
    } catch (error: any) { // Cast error to any for code === 'P2025' check
      console.error("Error removing from wishlist:", error);
      // Handle case where item might not exist to delete gracefully
      if (error.code === 'P2025') { // Prisma error code for record not found
        throw new Error("Product not found in wishlist.");
      }
      throw new Error("Failed to remove product from wishlist.");
    }
  }

  /**
   * Retrieves all wishlist items for a specific user.
   * Includes product details.
   * @param userId The ID of the user.
   * @returns An array of Wishlist items with product details.
   */
  static async getWishlistItems(userId: string) {
    try {
      const wishlistItems = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: true, // Include the full product object
        },
        orderBy: {
          createdAt: 'desc', // Order by most recently added
        },
      });
      return wishlistItems;
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      throw new Error("Failed to retrieve wishlist items.");
    }
  }

  /**
   * Checks if a specific product is in a user's wishlist.
   * @param userId The ID of the user.
   * @param productId The ID of the product to check.
   * @returns True if the product is in the wishlist, false otherwise.
   */
  static async isProductWishlisted(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistItem = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        select: { id: true } // Select only ID for efficiency
      });
      return !!wishlistItem; // Returns true if item exists, false otherwise
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      throw new Error("Failed to check product wishlist status.");
    }
  }

  /**
   * Counts wishlist items for a specific user.
   * @param userId The ID of the user.
   * @returns The total count of wishlist items for the user.
   */
  static async countWishlistItemsByUserId(userId: string): Promise<number> {
    return await prisma.wishlist.count({
      where: { userId: userId },
    });
  }
}
