/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/database/user.service";
import { revalidatePath } from 'next/cache'; // Import revalidatePath

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's profile information.
 * Body: { name?: string, email?: string, image?: string }
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { name, email, image } = await request.json();

    // Basic validation
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ message: "Invalid name provided." }, { status: 400 });
    }
    if (email !== undefined && typeof email !== 'string') {
      return NextResponse.json({ message: "Invalid email provided." }, { status: 400 });
    }
    if (image !== undefined && typeof image !== 'string') {
      return NextResponse.json({ message: "Invalid image URL provided." }, { status: 400 });
    }

    // Update the user profile
    const updatedUser = await UserService.updateUser(userId, { name, email, image });

    // Revalidate paths that display user information
    revalidatePath('/account'); // The main account page
    revalidatePath('/account/settings'); // The settings page itself
    // If user info is displayed in the header, you might need to revalidate the root layout
    // revalidatePath('/'); // Use with caution, revalidates entire root layout

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("[API/USER/PROFILE/PATCH] Error updating profile:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Fetches the authenticated user's profile information.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await UserService.findUserById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("[API/USER/PROFILE/GET] Error fetching profile:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Failed to fetch profile." },
      { status: 500 }
    );
  }
}
