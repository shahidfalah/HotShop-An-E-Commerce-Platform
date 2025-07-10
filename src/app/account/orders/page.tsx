/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/orders/page.tsx
// This is a Server Component. No "use client" directive.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderService } from "@/lib/database/order.service";
import { ReviewService } from "@/lib/database/review.service";

import OrderItemCard from "@/_components/account/OrderItemCard"; // Client Component for individual order item display
import { ArrowLeft, Package, Calendar, DollarSign, Info } from "lucide-react";
import Link from "next/link";

// Define interfaces based on your Prisma models and service responses
interface ProductDetailsForOrder {
  id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  salePrice: number | null;
}

interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: ProductDetailsForOrder;
}

interface Order {
  id: string;
  total: number;
  status: string; // OrderStatus enum string
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  orderItems: OrderItemWithProduct[];
}

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login'); // Redirect unauthenticated users
  }

  const userId = session.user.id;
  let orders: Order[] = [];
  let error: string | null = null;

  try {
    // Fetch ALL orders for the user, regardless of status
    const fetchedOrders = await OrderService.getAllUserOrdersWithProducts(userId);
    orders = fetchedOrders as Order[]; // Cast to your local interface
  } catch (err: any) {
    console.error("Failed to fetch user orders on server:", err);
    error = err.message || "Could not load your orders.";
  }

  const getStatusClasses = (orderStatus: string) => {
    switch (orderStatus) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";
      case "PENDING":
        return "bg-gray-100 text-gray-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Server-side rendering of error/no orders states
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-red-600 p-4 text-center">
        <Info className="w-12 h-12 mb-4" />
        <p className="text-xl font-semibold mb-2">Error Loading Orders</p>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-gray-700 p-4 text-center">
        <Info className="w-12 h-12 mb-4 text-gray-500" />
        <p className="text-xl font-semibold mb-2">No Orders Found</p>
        <p className="text-lg mb-6">It looks like you haven&apos;t placed any orders yet.</p>
        <Link href="/products">
          <button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-6 py-3 rounded-md">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-(--color-background) text-(--color-font) p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/account" className="text-gray-600 hover:text-(--color-primary) transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">My Orders</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map(async (order) => (
            <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm border border-(--color-border)">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-(--color-border)">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                  <div className="w-10 h-10 bg-(--color-bg-of-icons) rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-(--color-primary)" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-(--color-font)">Order ID: {order.id.slice(-6)}</h3>
                    <p className="text-(--color-muted) text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide w-[fit-content] ${getStatusClasses(order.status)}`}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-4">
                {await Promise.all(order.orderItems.map(async (item) => {
                  // Only check for review status if the order is DELIVERED
                  const hasReviewed = order.status === "DELIVERED"
                    ? await ReviewService.hasUserReviewedProduct(userId, item.productId)
                    : false; // Cannot review non-delivered items

                  return (
                    <OrderItemCard
                      key={item.id}
                      orderItem={item}
                      hasReviewed={hasReviewed}
                      userId={userId} // Pass userId to the Client Component for modal
                      orderStatus={order.status} // Pass order status to decide review button visibility
                    />
                  );
                }))}
              </div>

              {/* Order Summary Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-(--color-border) text-sm font-semibold">
                <div className="flex items-center text-(--color-font)">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total: ${order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
