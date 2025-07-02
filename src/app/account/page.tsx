"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react";

import { ShoppingBag, Heart, MessageCircle, LogOut, Star, Settings } from "lucide-react"

import ProfileInfo from "@/_components/account/ProfileInfo"
import AccountItem from "@/_components/account/AccountItem"
import AccountSection from "@/_components/account/AccountSection"
import AccountStats from "@/_components/account/AccountStats"

// Mock data - replace with your actual data fetching
let mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  image: "",
  role: "Premium Member",
}

const mockStats = {
  totalOrders: 12,
  wishlistItems: 8,
  reviewsGiven: 5,
}

export default function AccountPage() {
  const { data: session } = useSession();
  mockUser={
    name: session?.user?.name || "John Doe",
    email: session?.user?.email as string,
    image: session?.user?.image || "/defaultProfileImage.jpeg",
    role: session?.user?.role,
  }

  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <main className="min-h-screen bg-(--color-background) text-(--color-font)">
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          {/* Profile Info */}
          <ProfileInfo user={mockUser} />

          {/* Stats */}
          <AccountStats stats={mockStats} />

          {/* Account Actions */}
          <AccountSection title="Account">
            <AccountItem
              icon={ShoppingBag}
              title="Past Orders"
              subtitle="View your order history"
              count={mockStats.totalOrders}
              onClick={() => handleNavigation("/account/orders")}
            />

            <AccountItem
              icon={Heart}
              title="Wishlist"
              subtitle="Your saved items"
              count={mockStats.wishlistItems}
              onClick={() => handleNavigation("/account/wishlist")}
            />

            <AccountItem
              icon={Star}
              title="My Reviews"
              subtitle="Reviews you've written"
              count={mockStats.reviewsGiven}
              onClick={() => handleNavigation("/account/reviews")}
            />
          </AccountSection>

          {/* Support */}
          <AccountSection title="Support">
            <AccountItem
              icon={MessageCircle}
              title="Contact Support"
              subtitle="Get help with your account"
              onClick={() => handleNavigation("/support")}
            />
          </AccountSection>

          {/* Account Settings */}
          <AccountSection title="Settings">
            <AccountItem
              icon={Settings}
              title="Account Settings"
              subtitle="Manage your account preferences"
              onClick={() => handleNavigation("/account/settings")}
            />
          </AccountSection>

          {/* Logout */}
          <div className="mt-8">
            <AccountItem
              icon={LogOut}
              title={isLoggingOut ? "Logging out..." : "Log Out"}
              onClick={handleLogout}
              variant="danger"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-font mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile & Stats */}
              <div className="lg:col-span-1">
                <ProfileInfo user={mockUser} />
                <AccountStats stats={mockStats} />
              </div>

              {/* Right Column - Account Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-font mb-4">Account</h3>

                    <AccountItem
                      icon={ShoppingBag}
                      title="Past Orders"
                      subtitle="View order history"
                      count={mockStats.totalOrders}
                      onClick={() => handleNavigation("/account/orders")}
                    />

                    <AccountItem
                      icon={Heart}
                      title="Wishlist"
                      subtitle="Saved items"
                      count={mockStats.wishlistItems}
                      onClick={() => handleNavigation("/account/wishlist")}
                    />

                    <AccountItem
                      icon={Star}
                      title="My Reviews"
                      subtitle="Your reviews"
                      count={mockStats.reviewsGiven}
                      onClick={() => handleNavigation("/account/reviews")}
                    />
                  </div>

                  {/* Support & Settings Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-font mb-4">Support & Settings</h3>

                    <AccountItem
                      icon={MessageCircle}
                      title="Contact Support"
                      subtitle="Get help"
                      onClick={() => handleNavigation("/support")}
                    />

                    <AccountItem
                      icon={Settings}
                      title="Account Settings"
                      subtitle="Manage preferences"
                      onClick={() => handleNavigation("/account/settings")}
                    />

                    <div className="pt-4">
                      <AccountItem
                        icon={LogOut}
                        title={isLoggingOut ? "Logging out..." : "Log Out"}
                        onClick={handleLogout}
                        variant="danger"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
