/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/settings/page.tsx
// This is a Server Component. No "use client" directive.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/database/user.service";

import ProfileSettingsForm from "@/_components/account/ProfileSettingsForm"; // Client Component for the form
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Define the expected structure of user data fetched from the service
interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string; // Assuming role is a string
  createdAt: Date;
  updatedAt: Date;
}

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login'); // Redirect unauthenticated users
  }

  const userId = session.user.id;
  let userProfile: UserProfile | null = null;
  let error: string | null = null;

  try {
    userProfile = await UserService.findUserById(userId) as UserProfile;
    if (!userProfile) {
      error = "User profile not found.";
    }
  } catch (err: any) {
    console.error("Failed to fetch user profile on server:", err);
    error = err.message || "Could not load your profile.";
  }

  // This function will be passed to the client component ProfileSettingsForm
  // and called when the profile is updated.
  // It will then trigger a server-side revalidation to update the displayed session info.
  const handleProfileUpdated = async () => {
    "use server"; // Mark this function as a Server Action
    revalidatePath('/account'); // Revalidate the main account page
    revalidatePath('/account/settings'); // Revalidate the settings page itself
    // You might also want to revalidate the session if the user's name/image is shown in the header
    // This typically involves revalidating the root layout or a specific segment.
    // For simplicity, we'll rely on the paths above.
  };

  return (
    <main className="min-h-screen bg-(--color-background) text-(--color-font) p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-(--color-surface) rounded-lg shadow-sm border border-(--color-border) p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Link href="/account" className="text-gray-600 hover:text-(--color-primary) transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-font)">Account Settings</h1>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : userProfile ? (
          <ProfileSettingsForm
            initialProfile={userProfile}
            onProfileUpdated={handleProfileUpdated} // Pass the Server Action
          />
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">Loading profile data...</p>
          </div>
        )}
      </div>
    </main>
  );
}
