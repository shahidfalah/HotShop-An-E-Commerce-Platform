/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/account/stats/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/account/stats
 * Fetches statistics (total orders, wishlist items, reviews given) for the authenticated user.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  console.log("============within /api/account/stats+++++++++++++")
  try {
    const userId = session.user.id;

    // Fetch total orders count
    const totalOrders = await prisma.order.count({
      where: { userId: userId },
    });

    // Fetch wishlist items count
    const wishlistItems = await prisma.wishlist.count({
      where: { userId: userId },
    });

    // Fetch reviews given count
    const reviewsGiven = await prisma.review.count({
      where: { userId: userId },
    });

    console.log("totalOrders,wishlistItems,reviewsGiven,",{
      totalOrders,
      wishlistItems,
      reviewsGiven,
    })

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        wishlistItems,
        reviewsGiven,
      },
    });
  } catch (error) {
    console.error("[API/ACCOUNT/STATS/GET] Error fetching user stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch user statistics", error: (error as Error).message },
      { status: 500 }
    );
  }
}
