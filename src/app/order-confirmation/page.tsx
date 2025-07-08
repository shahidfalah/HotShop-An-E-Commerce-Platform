// src/app/order-confirmation/page.tsx
"use client"; // This will be a client component for potential future interactivity or session access

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/_components/ui/button';

export default function OrderConfirmationPage() {
  // In a real application, you might fetch order details here using a query parameter
  // (e.g., orderId) or from a global state/context if the order details were passed.
  // For simplicity, this page will display a generic success message.

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-background) text-gray-900 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center max-w-md w-full border border-gray-200">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          You will receive an email confirmation shortly with your order details.
        </p>

        <div className="flex flex-col space-y-4">
          <Link href="/account/orders"> {/* Assuming you will have a /my-orders page */}
            <Button className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-(--color-background) py-3 text-lg shadow-md">
              View My Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full border-(--color-border) text-(--color-background) hover:bg-(--color-background) hover:text-(--color-font)  py-3 text-lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
