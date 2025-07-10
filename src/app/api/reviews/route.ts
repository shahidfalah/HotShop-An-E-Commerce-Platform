// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReviewService } from "@/lib/database/review.service";

/**
 * POST /api/reviews
 * Handles the submission of a new product review.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { productId, rating, comment } = await request.json();
    const userId = session.user.id;

    // Basic validation
    if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid product ID or rating." }, { status: 400 });
    }

    // Check if user has already reviewed this product (based on unique constraint in schema)
    const hasReviewed = await ReviewService.hasUserReviewedProduct(userId, productId);
    if (hasReviewed) {
      return NextResponse.json({ message: "You have already reviewed this product." }, { status: 409 }); // Conflict
    }

    const review = await ReviewService.createReview(userId, productId, rating, comment);

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    }, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("[API/REVIEWS/POST] Error submitting review:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
