// src/_components/account/OrderItemCard.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/_components/ui/button";
import ReviewFormModal from "@/_components/ui/ReviewFormModal"; // The review form modal

// Define the expected structure of an order item received from the server
interface ProductDetailsForOrder {
  id: string;
  title: string;
  slug: string;
  images: string[]; // This will now contain full public URLs from server processing
  price: number;
  salePrice: number | null;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number; // The price at which it was sold in THIS order (Now a number)
  product: ProductDetailsForOrder;
}

interface OrderItemCardProps {
  orderItem: OrderItem;
  hasReviewed: boolean;
  userId: string; // Pass userId to the card for the modal
  orderStatus: string; // New prop: status of the parent order
}

export default function OrderItemCard({ orderItem, hasReviewed, userId, orderStatus }: OrderItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use a robust fallback image URL directly from placehold.co
  const defaultImageUrl = `https://placehold.co/80x80/E0E0E0/0D171C?text=No+Image`; // Adjusted size for consistency

  // CRITICAL FIX: Use the image URL directly. It's already a full public URL from the API.
  const productImageUrl = orderItem.product.images && orderItem.product.images.length > 0
    ? orderItem.product.images[0]
    : defaultImageUrl; // Use the robust default URL here

  const handleReviewButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    setIsModalOpen(false);
    // When a review is submitted, the API route for reviews already triggers
    // revalidation of '/account/orders' and '/account'.
    // This means the next time the user navigates to or refreshes this page,
    // the 'hasReviewed' status will be up-to-date.
    console.log("Review submitted. Parent page revalidation for /account/orders is handled by API route.");
  };

  // Determine if the "Write Review" button should be shown
  const canWriteReview = orderStatus === "DELIVERED" && !hasReviewed;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-(--color-background) p-4 rounded-md border border-gray-100">
      {/* Product Image and Link */}
      <Link href={`/products/${orderItem.product.slug}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
          <Image
            src={productImageUrl} // Use the direct public URL
            alt={orderItem.product.title}
            width={80} // Explicit width
            height={80} // Explicit height
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImageUrl; // Fallback on error
            }}
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-grow">
        <Link href={`/products/${orderItem.product.slug}`} className="text-lg font-semibold text-(--color-font) hover:text-(--color-primary) transition-colors line-clamp-1">
          {orderItem.product.title}
        </Link>
        <p className="text-gray-600 text-sm">Quantity: {orderItem.quantity}</p>
        {/* Ensure price is displayed with two decimal places */}
        <p className="text-gray-800 font-medium">Price: ${orderItem.price.toFixed(2)}</p>
      </div>

      {/* Review Button / Status */}
      <div className="flex-shrink-0">
        {canWriteReview ? (
          <Button
            onClick={handleReviewButtonClick}
            className="bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors px-4 py-2 rounded-md text-sm"
          >
            Write Review
          </Button>
        ) : orderStatus === "DELIVERED" && hasReviewed ? (
          <span className="text-sm text-green-600 font-medium px-3 py-1 rounded-full bg-green-50 border border-green-200">Reviewed</span>
        ) : (
          // For non-delivered orders, or if no review button/status is needed
          <span className="text-sm text-gray-500 font-medium px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
            {orderStatus === "CANCELLED" ? "Not Reviewable" : "Pending Delivery"}
          </span>
        )}
      </div>

      {/* Review Form Modal */}
      {isModalOpen && (
        <ReviewFormModal
          productId={orderItem.productId}
          productTitle={orderItem.product.title}
          userId={userId}
          onClose={() => setIsModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
