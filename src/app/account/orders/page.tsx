/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Package, Calendar, DollarSign, Loader2, Info, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/_components/ui/button"; // Assuming you have a Button component

// Define interfaces based on your API response for orders
interface OrderProduct {
  id: string;
  title: string;
  images: string[];
  price: number; // The original product price
  salePrice: number | null; // The product's sale price
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number; // The price at which it was sold in THIS order
  productId: string;
  product: OrderProduct;
}

interface OrderAddress {
  id: string;
  fullName: string;
  address1: string;
  city: string;
  state: string;
  zipCode: string | null;
  country: string | null;
}

interface Payment {
  id: string;
  paymentType: string; // e.g., 'CREDIT_CARD', 'PAYPAL', 'CASH_ON_DELIVERY'
  status: string; // e.g., 'PENDING', 'COMPLETED'
  amount: number;
}

interface Order {
  id: string;
  total: number;
  status: string; // OrderStatus enum string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId: string;
  orderItems: OrderItem[];
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  payment: Payment | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const { status } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders.");
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setOrders([]); // No data or unexpected format
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "An error occurred while fetching your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login'); // Redirect to login if not authenticated
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router, fetchOrders]);

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background) text-gray-600">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-background) text-red-600 p-4 text-center">
        <XCircle className="w-12 h-12 mb-4" />
        <p className="text-xl font-semibold mb-2">Error Loading Orders</p>
        <p className="text-lg">{error}</p>
        <Button onClick={fetchOrders} className="mt-6 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white">
          Try Again
        </Button>
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
          <Button className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white px-6 py-3">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-font) p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full bg-(--color-surface) shadow-md hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-(--color-font)" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">My Orders</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-(--color-surface) rounded-lg p-4 shadow-sm border border-(--color-border)">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-(--color-border)">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                  <div className="w-10 h-10 bg-(--color-bg-of-icons) rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-(--color-primary)" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-(--color-font)">Order ID: {order.id}</h3>
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
                  className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusClasses(order.status)}`}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 mr-4 rounded-md overflow-hidden border border-(--color-border)">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/64x64/E0E0E0/0D171C?text=No+Image`;
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{item.product.title}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-(--color-primary) font-semibold">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-(--color-border) text-sm font-semibold">
                <div className="flex items-center text-(--color-font)">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total: ${order.total.toFixed(2)}
                </div>
                {/* Link to Order Details Page (if you create one later) */}
                {/* <Link href={`/account/orders/${order.id}`}>
                  <Button variant="link" className="p-0 h-auto text-(--color-primary) hover:underline">
                    View Details
                  </Button>
                </Link> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
