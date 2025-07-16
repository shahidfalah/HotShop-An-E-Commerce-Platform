/* eslint-disable @typescript-eslint/no-explicit-any */
// src/_components/ui/EditReviewFormModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/_components/ui/button";
import { Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditReviewFormModalProps {
  reviewId: string;
  productTitle: string;
  initialRating: number;
  initialComment: string;
  onClose: () => void;
  onReviewUpdated: () => void;
}

export default function EditReviewFormModal({
  reviewId,
  productTitle,
  initialRating,
  initialComment,
  onClose,
  onReviewUpdated,
}: EditReviewFormModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state if initial props change (e.g., modal reused for different review)
  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update review.');
      }

      toast.success('Review updated successfully!');
      onReviewUpdated();
    } catch (err: any) {
      console.error("Error updating review:", err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to update review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12121275] bg-opacity-50 p-4">
      <div className="bg-(--color-background) rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-(--color-font) mb-4">Edit Review for {productTitle}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            {error && rating === 0 && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Your Comment (Optional)</label>
            <textarea
              id="comment"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-(--color-primary) focus:border-(--color-primary) resize-y text-gray-900 bg-white"
              placeholder="Tell us what you think about the product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          {error && rating !== 0 && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-hover) transition-colors py-2.5 rounded-md text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Review'}
          </Button>
        </form>
      </div>
    </div>
  );
}
