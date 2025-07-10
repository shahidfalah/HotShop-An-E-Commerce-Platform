// src/app/api/reviews/[reviewId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReviewService } from "@/lib/database/review.service";
import { revalidatePath } from 'next/cache'; // Import revalidatePath
import { prisma } from "@/lib/prisma";

/**
 * Helper to check if the user is authorized to modify this review.
 * In a real app, you'd also check if the review belongs to the user.
 */
async function authorizeReviewAction(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });

  if (!review) {
    return { authorized: false, status: 404, message: "Review not found." };
  }
  if (review.userId !== userId) {
    return { authorized: false, status: 403, message: "Unauthorized: You do not own this review." };
  }
  return { authorized: true };
}

/**
 * PATCH /api/reviews/[reviewId]
 * Updates an existing review.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { reviewId } = params;
  const userId = session.user.id;

  const authCheck = await authorizeReviewAction(reviewId, userId);
  if (!authCheck.authorized) {
    return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
  }

  try {
    const { rating, comment } = await request.json();

    // Basic validation for update data
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json({ message: "Invalid rating provided." }, { status: 400 });
    }
    if (comment !== undefined && typeof comment !== 'string') {
      return NextResponse.json({ message: "Invalid comment provided." }, { status: 400 });
    }

    const updatedReview = await ReviewService.updateReview(reviewId, { rating, comment });

    // Revalidate the /account/reviews page to show the updated review immediately
    revalidatePath('/account/reviews');
    // Also revalidate the product page if reviews are shown there
    // You might need the product slug here, which would require fetching the review with product details
    // For simplicity, we'll just revalidate the reviews page for now.

    return NextResponse.json({
      success: true,
      message: "Review updated successfully!",
      data: updatedReview,
    });
  } catch (error) {
    console.error(`[API/REVIEWS/${reviewId}/PATCH] Error updating review:`, error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to update review." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[reviewId]
 * Deletes a review.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { reviewId } = params;
  const userId = session.user.id;

  const authCheck = await authorizeReviewAction(reviewId, userId);
  if (!authCheck.authorized) {
    return NextResponse.json({ message: authCheck.message }, { status: authCheck.status });
  }

  try {
    await ReviewService.deleteReview(reviewId);

    // Revalidate the /account/reviews page to reflect the deletion
    revalidatePath('/account/reviews');
    // Also revalidate the product page if reviews are shown there

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    console.error(`[API/REVIEWS/${reviewId}/DELETE] Error deleting review:`, error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to delete review." },
      { status: 500 }
    );
  }
}
