/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/user.service.ts
import { prisma } from "@/lib/prisma";

export class UserService {
  /**
   * Counts all users in the database.
   * @returns The total count of users.
   */
  static async countAllUsers(): Promise<number> {
    return await prisma.user.count();
  }

  /**
   * Finds a user by their ID.
   * @param userId The ID of the user.
   * @returns The user object or null if not found.
   */
  static async findUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Updates a user's profile information.
   * @param userId The ID of the user to update.
   * @param data The data to update (name, email, image).
   * @returns The updated user object.
   */
  static async updateUser(userId: string, data: { name?: string; email?: string; image?: string }) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          updatedAt: new Date(), // Update timestamp
        },
        select: { // Select fields to return
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
        throw new Error("Email already in use by another account.");
      }
      throw new Error("Failed to update user profile.");
    }
  }
}
