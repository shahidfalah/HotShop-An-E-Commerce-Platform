/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { ProductService } from "@/lib/database/product.service";
import { CategoryService } from "@/lib/database/category.service";
import { UserService } from "@/lib/database/user.service"; // Import UserService
import { ReviewService } from "@/lib/database/review.service"; // Import ReviewService
import { OrderService } from "@/lib/database/order.service"; // Import OrderService

export async function GET() {
  try {
    // Fetch counts from your services
    const totalProducts = await ProductService.countAllProducts();
    const totalCategories = await CategoryService.countAllCategories();
    const totalUsers = await UserService.countAllUsers(); // Now uncommented
    const totalReviews = await ReviewService.countAllReviews(); // Now uncommented
    const averageRating = await ReviewService.getAverageRating(); // Now uncommented
    const totalOrders = await OrderService.countAllOrders(); // Now uncommented
    const totalRevenue = await OrderService.getTotalRevenue(); // Now uncommented

    return NextResponse.json({
      success: true,
      data: {
        products: { total: totalProducts, change: 0 }, // 'change' can be implemented later
        categories: { total: totalCategories, change: 0 },
        users: { total: totalUsers, change: 0 }, // Using actual count
        reviews: { total: totalReviews, avgRating: averageRating }, // Using actual counts/avg
        orders: { total: totalOrders, revenue: totalRevenue }, // Using actual counts/revenue
      },
    });
  } catch (error: any) {
    console.error("API: Error fetching admin stats:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
