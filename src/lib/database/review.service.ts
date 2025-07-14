/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/database/review.service.ts
import { prisma } from "@/lib/prisma";
import { getPublicFileUrl, getPublicAvatarUrl } from "@/lib/storage/supabase"; // Import necessary functions

// Helper to format product data within a review, including image URLs
function formatReviewProduct(product: any) {
    if (!product) return null;

    // Ensure product images are full public URLs
    const formattedImages = Array.isArray(product.images)
        ? product.images.map((img: string) => getPublicFileUrl("PRODUCTS", img))
        : [];

    return {
        ...product,
        images: formattedImages,
        // Convert Decimal fields to numbers if they exist, for consistency
        price: product.price ? parseFloat(product.price.toString()) : 0,
        salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
        width: product.width ? parseFloat(product.width.toString()) : null,
        height: product.height ? parseFloat(product.height.toString()) : null,
    };
}

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

    /**
     * Retrieves all reviews written by a specific user.
     * Includes product details and user details for each review, with image URLs formatted.
     * @param userId The ID of the user.
     * @returns An array of formatted review objects.
     */
    static async getReviewsByUserId(userId: string) {
        try {
            const reviews = await prisma.review.findMany({
                where: { userId: userId },
                include: {
                    product: { // Include product details
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            images: true, // Make sure to select images from the product
                            price: true,
                            salePrice: true,
                            isFlashSale: true,
                            saleEnd: true,
                            // Add any other product fields you need to display in the review card
                        },
                    },
                    user: { // Include user details (e.g., reviewer's name/avatar)
                        select: {
                            id: true,
                            name: true,
                            image: true, // Assuming user image is stored here (e.g., Supabase path or OAuth URL)
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc', // Order by most recent review first
                },
            });

            // Map and format each review object to ensure image URLs are public
            return reviews.map(review => ({
                ...review,
                // Format the product images within the review
                product: review.product ? formatReviewProduct(review.product) : null,
                // Format the user's avatar image if available
                user: review.user ? {
                    ...review.user,
                    image: getPublicAvatarUrl(review.user.image) // Use getPublicAvatarUrl for user avatars
                } : null
            }));
        } catch (error) {
            console.error("Error fetching reviews by user ID:", error);
            throw new Error("Failed to retrieve user reviews.");
        }
    }

    /**
     * Checks if a user has already reviewed a specific product.
     * This assumes a unique constraint on (userId, productId) in your Review model.
     * @param userId The ID of the user.
     * @param productId The ID of the product.
     * @returns True if the user has reviewed the product, false otherwise.
     */
    static async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
        try {
            const review = await prisma.review.findUnique({
                where: {
                    userId_productId: { // Assumes this unique compound key exists in your schema
                        userId: userId,
                        productId: productId,
                    },
                },
                select: { id: true }, // Select only ID for efficiency
            });
            return !!review; // Returns true if a review exists, false otherwise
        } catch (error) {
            console.error("Error checking if user reviewed product:", error);
            throw new Error("Failed to check review status for product.");
        }
    }

    /**
     * Creates a new review.
     * @param userId The ID of the user writing the review.
     * @param productId The ID of the product being reviewed.
     * @param rating The rating (1-5).
     * @param comment The review comment (optional).
     * @returns The created review object.
     */
    static async createReview(userId: string, productId: string, rating: number, comment?: string) {
        try {
            const review = await prisma.review.create({
                data: {
                    userId,
                    productId,
                    rating,
                    comment,
                },
            });
            return review;
        } catch (error) {
            console.error("Error creating review:", error);
            throw new Error("Failed to submit review.");
        }
    }

    /**
     * Updates an existing review.
     * @param reviewId The ID of the review to update.
     * @param data The data to update (rating and/or comment).
     * @returns The updated review object.
     */
    static async updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
        try {
            const updatedReview = await prisma.review.update({
                where: { id: reviewId },
                data: {
                    rating: data.rating,
                    comment: data.comment,
                    updatedAt: new Date(), // Update timestamp
                },
            });
            return updatedReview;
        } catch (error) {
            console.error(`Error updating review ${reviewId}:`, error);
            // Handle specific Prisma errors, e.g., P2025 if review not found
            if ((error as any).code === 'P2025') {
                throw new Error("Review not found.");
            }
            throw new Error("Failed to update review.");
        }
    }

    /**
     * Deletes a review by its ID.
     * @param reviewId The ID of the review to delete.
     * @returns The deleted review object.
     */
    static async deleteReview(reviewId: string) {
        try {
            const deletedReview = await prisma.review.delete({
                where: { id: reviewId },
            });
            return deletedReview;
        } catch (error) {
            console.error(`Error deleting review ${reviewId}:`, error);
            if ((error as any).code === 'P2025') {
                throw new Error("Review not found.");
            }
            throw new Error("Failed to delete review.");
        }
    }
}
