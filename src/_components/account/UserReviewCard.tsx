/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/account/UserReviewCard.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import EditReviewFormModal from "@/_components/ui/EditReviewFormModal"; // New Edit Modal
import DeleteConfirmationModal from "@/_components/ui/DeleteConfirmationModal"; // New Delete Modal
import { toast } from 'react-hot-toast'; // For notifications

// Define the expected structure of a review item received from the server
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date; // Prisma returns Date objects
  product: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
}

interface UserReviewCardProps {
  review: Review;
  // Callback to notify parent (AccountReviewsPage) to revalidate data
  onReviewAction: () => void;
}

export default function UserReviewCard({ review, onReviewAction }: UserReviewCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleReviewUpdated = () => {
    setIsEditModalOpen(false);
    onReviewAction(); // Trigger parent to revalidate
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review.');
      }

      toast.success('Review deleted successfully!');
      setIsDeleteModalOpen(false);
      onReviewAction(); // Trigger parent to revalidate
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err.message || 'Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  const displayDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const productImageUrl = review.product.images && review.product.images.length > 0
    ? review.product.images[0]
    : `https://placehold.co/64x64/E0E0E0/0D171C?text=No+Image`; // Fallback image

  return (
    <div className="bg-(--color-background) rounded-lg p-4 shadow-sm border border-(--color-border) flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Product Image and Link */}
      <Link href={`/products/${review.product.slug}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
          <Image
            src={productImageUrl}
            alt={review.product.title}
            fill
            className="object-cover"
            sizes="80px"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/64x64/E0E0E0/0D171C?text=No+Image`; // Fallback on error
            }}
          />
        </div>
      </Link>

      {/* Review Content */}
      <div className="flex-grow">
        <Link href={`/products/${review.product.slug}`} className="text-lg font-semibold text-(--color-font) hover:text-(--color-primary) transition-colors line-clamp-1">
          {review.product.title}
        </Link>
        <div className="flex items-center space-x-1 text-yellow-500 my-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(review.rating) ? "fill-current text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">({review.rating.toFixed(1)})</span>
        </div>
        <p className="text-gray-700 text-sm mt-2 line-clamp-3">{review.comment}</p>
        <p className="text-gray-500 text-xs mt-2">Reviewed on {displayDate}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="text-(--color-primary) border-2 border-(--color-primary) bg-transparent px-4 py-2 rounded-md hover:bg-(--color-primary) hover:text-white transition"
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          className="text-red-600 border-2 border-red-600 bg-transparent px-4 py-2 rounded-md hover:bg-red-600 hover:text-white transition"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>

      {/* Edit Review Modal */}
      {isEditModalOpen && (
        <EditReviewFormModal
          reviewId={review.id}
          productTitle={review.product.title}
          initialRating={review.rating}
          initialComment={review.comment}
          onClose={() => setIsEditModalOpen(false)}
          onReviewUpdated={handleReviewUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete your review for "${review.product.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}
