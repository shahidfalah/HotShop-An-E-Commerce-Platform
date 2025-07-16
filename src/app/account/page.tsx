/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Your NextAuth configuration
import { redirect } from "next/navigation"; // For server-side redirects
import ProfileInfo from "@/_components/account/ProfileInfo";
import AccountItem from "@/_components/account/AccountItem"; // Client Component
import AccountSection from "@/_components/account/AccountSection";
import AccountStats from "@/_components/account/AccountStats"; // Client Component
import LogoutButton from "@/_components/account/LogoutButton"; // Client Component

// Import services for direct database access
import { OrderService } from "@/lib/database/order.service";
import { WishlistService } from "@/lib/database/wishlist.service"; // Assuming you have a WishlistService
import { ReviewService } from "@/lib/database/review.service";

// Define interface for user stats
interface UserStats {
  totalOrders: number;
  wishlistItems: number;
  reviewsGiven: number;
}

// Function to fetch user stats directly from Prisma on the server
async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    // Fetch total orders count
    const totalOrders = await OrderService.countOrdersByUserId(userId);

    // Fetch wishlist items count
    const wishlistItems = await WishlistService.countWishlistItemsByUserId(userId);

    // Fetch reviews given count
    const reviewsGiven = await ReviewService.countReviewsByUserId(userId);

    return {
      totalOrders,
      wishlistItems,
      reviewsGiven,
    };
  } catch (error) {
    console.error("Error fetching user stats directly from Prisma:", error);
    return null;
  }
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  // If not authenticated, redirect to login page
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch real stats for the authenticated user directly from Prisma
  const userStats = await getUserStats(session.user.id);

  // Prepare user object for ProfileInfo
  const user = {
    name: session.user.name || "Guest",
    email: session.user.email || "",
    image: session.user.image || "/defaultProfileImage.jpeg",
    role: (session.user as any).role || "User",
  };

  // Default stats if fetching fails
  const defaultStats: UserStats = { totalOrders: 0, wishlistItems: 0, reviewsGiven: 0 };
  const statsToDisplay = userStats || defaultStats;

  return (
    <main className="min-h-screen bg-(--color-background) text-(--color-font)">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          {/* Profile Info (Client Component, receives props) */}
          <ProfileInfo user={user} />

          {/* Stats (Client Component, receives props) */}
          <AccountStats stats={statsToDisplay} />

          {/* Account Actions (AccountItem is a Client Component due to onClick/Link) */}
          <AccountSection title="Account">
            <AccountItem
              icon="ShoppingBag" // Passed as component
              title="Past Orders"
              subtitle="View your order history"
              count={statsToDisplay.totalOrders}
              path="/account/orders" // Use path prop for navigation
            />

            <AccountItem
              icon="Heart" // Passed as component
              title="Wishlist"
              subtitle="Your saved items"
              count={statsToDisplay.wishlistItems}
              path="/account/wishlist" // Use path prop for navigation
            />

            <AccountItem
              icon="Star" // Passed as component
              title="My Reviews"
              subtitle="Reviews you've written"
              count={statsToDisplay.reviewsGiven}
              path="/account/reviews" // Use path prop for navigation
            />
          </AccountSection>

          {/* Support */}
          <AccountSection title="Support">
            <AccountItem
              icon="MessageCircle" // Passed as component
              title="Contact Support"
              subtitle="Get help with your account"
              path="/support"
            />
          </AccountSection>

          {/* Account Settings */}
          <AccountSection title="Settings">
            <AccountItem
              icon="Settings" // Passed as component
              title="Account Settings"
              subtitle="Manage your account preferences"
              path="/account/settings"
            />
          </AccountSection>

          {/* Logout Button (Client Component) */}
          <div className="mt-8">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-(--color-font) mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile & Stats */}
              <div className="lg:col-span-1">
                <ProfileInfo user={user} />
                <AccountStats stats={statsToDisplay} />
              </div>

              {/* Right Column - Account Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-(--color-font) mb-4">Account</h3>

                    <AccountItem
                      icon="ShoppingBag"
                      title="Past Orders"
                      subtitle="View order history"
                      count={statsToDisplay.totalOrders}
                      path="/account/orders"
                    />

                    <AccountItem
                      icon="Heart"
                      title="Wishlist"
                      subtitle="Saved items"
                      count={statsToDisplay.wishlistItems}
                      path="/account/wishlist"
                    />

                    <AccountItem
                      icon="Star"
                      title="My Reviews"
                      subtitle="Your reviews"
                      count={statsToDisplay.reviewsGiven}
                      path="/account/reviews"
                    />
                  </div>

                  {/* Support & Settings Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-(--color-font) mb-4">Support & Settings</h3>

                    <AccountItem
                      icon="MessageCircle"
                      title="Contact Support"
                      subtitle="Get help"
                      path="/contact"
                    />

                    <AccountItem
                      icon="Settings"
                      title="Account Settings"
                      subtitle="Manage preferences"
                      path="/account/settings"
                    />

                    <div>
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
