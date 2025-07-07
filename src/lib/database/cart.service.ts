// src/lib/database/cart.service.ts
import { prisma } from "../prisma";
// import type { CartItem } from "@/generated/prisma"; // Only import CartItem, as Cart model doesn't exist

export class CartService {
  /**
   * Gets a user's cart items by their ID.
   * This method now directly fetches CartItems associated with a user.
   * @param userId The ID of the user.
   * @returns An array of the user's cart items, including their related products.
   */
  static async getCartItemsByUserId(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true, // Include product details with each cart item
      },
      orderBy: { createdAt: "asc" }, // Order items for consistent display
    });
  }

  /**
   * Adds a product to the user's cart or updates its quantity if already present.
   * This method now directly manages CartItems without a separate Cart model.
   * @param userId The ID of the user.
   * @param productId The ID of the product to add.
   * @param quantity The quantity to add/set.
   * @returns The updated cart item or the new cart item.
   */
  static async addItemToCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    // Check if the product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      throw new Error("Product not found.");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be positive.");
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { // Unique constraint on (userId, productId)
          userId: userId,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
      }
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id }, // Update by ID
        data: { quantity: newQuantity },
        include: { product: true },
      });
      return updatedItem;
    } else {
      // Add new item
      if (quantity > product.stock) {
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
      }
      const newItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: { product: true },
      });
      return newItem;
    }
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * @param cartItemId The ID of the cart item to update.
   * @param newQuantity The new quantity for the item.
   * @param userId (Optional) User ID to verify ownership.
   * @returns The updated cart item or null if removed.
   */
  static async updateCartItemQuantity(
    cartItemId: string,
    newQuantity: number,
    userId?: string // Optional for added security
  ) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true }, // Include product for stock check
    });

    if (!item) {
      throw new Error("Cart item not found.");
    }
    // Verify ownership if userId is provided
    if (userId && item.userId !== userId) {
      throw new Error("Unauthorized: Cart item does not belong to user.");
    }

    if (newQuantity <= 0) {
      // If quantity is 0 or less, remove the item
      await this.removeCartItem(cartItemId, userId);
      return null; // Indicate item was removed
    }
    if (newQuantity > item.product.stock) {
      throw new Error(
        `Not enough stock for ${item.product.title}. Only ${item.product.stock} available.`
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQuantity },
      include: { product: true },
    });
    return updatedItem;
  }

  /**
   * Removes a specific item from the cart.
   * @param cartItemId The ID of the cart item to remove.
   * @param userId (Optional) User ID to verify ownership.
   */
  static async removeCartItem(cartItemId: string, userId?: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item) {
      throw new Error("Cart item not found.");
    }
    // Verify ownership if userId is provided
    if (userId && item.userId !== userId) {
      throw new Error("Unauthorized: Cart item does not belong to user.");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
}
