/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/reviews/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewService } from "@/lib/database/review.service";
import { revalidatePath } from 'next/cache';

import UserReviewCard from "@/_components/account/UserReviewCard"; // Client Component for individual review display
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AccountReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login'); // Redirect unauthenticated users
  }

  let reviews: any[] = [];
  let error: string | null = null;

  try {
    reviews = await ReviewService.getReviewsByUserId(session.user.id);
  } catch (err: any) {
    console.error("Failed to fetch user reviews on server:", err);
    error = err.message || "Could not load your reviews.";
  }

  // This function will be passed to the client component UserReviewCard
  // and called when a review is updated or deleted.
  // It will then trigger a server-side revalidation.
  const handleReviewAction = async () => {
    "use server"; // Mark this function as a Server Action
    revalidatePath('/account/reviews');
  };

  return (
    <main className="min-h-screen bg-(--color-background) text-(--color-font) p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Link href="/account" className="text-gray-600 hover:text-(--color-primary) transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">My Reviews</h1>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">You haven&apos;t written any reviews yet.</p>
            <p className="mt-2 text-sm">Browse our products and share your thoughts!</p>
            <Link href="/products" className="mt-4 inline-block bg-(--color-primary) text-white px-6 py-2 rounded-md hover:bg-(--color-primary-hover) transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <UserReviewCard
                key={review.id}
                review={review}
                onReviewAction={handleReviewAction}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
