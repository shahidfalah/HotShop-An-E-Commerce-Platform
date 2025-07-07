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

  // You might have other user-related methods here (e.g., findUserById, createUser, etc.)
  // Add them if they exist in your current setup.
}
