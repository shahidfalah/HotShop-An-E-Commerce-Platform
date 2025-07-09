// src/lib/database/review.service.ts
import { prisma } from "@/lib/prisma";

export class ReviewService {
  /**
   * Counts all reviews in the database.
   * @returns The total count of reviews.
   */
  static async countAllReviews(): Promise<number> {
    return await prisma.review.count();
  }

  /**
   * Counts reviews for a specific user.
   * @param userId The ID of the user.
   * @returns The total count of reviews given by the user.
   */
  static async countReviewsByUserId(userId: string): Promise<number> {
    return await prisma.review.count({
      where: { userId: userId },
    });
  }

  /**
   * Calculates the average rating across all reviews.
   * @returns The average rating as a number, or 0 if no reviews exist.
   */
  static async getAverageRating(): Promise<number> {
    const result = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    // Return the average rating, or 0 if no reviews exist
    return result._avg.rating ? parseFloat(result._avg.rating.toFixed(1)) : 0;
  }

  // You might have other review-related methods here (e.g., createReview, findReviewsByProduct, etc.)
  // Add them if they exist in your current setup.
}
