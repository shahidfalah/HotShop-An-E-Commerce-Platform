import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"
import { Role } from "@/generated/prisma"
import type { NextRequest } from "next/server"

// Cache for admin checks to reduce database queries
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get the current session and check if user is admin
 * Returns the session if user is admin, null otherwise
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  // Check cache first
  const cacheKey = session.user.email
  const cached = adminCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isAdmin ? session : null
  }

  // Check database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  const isAdmin = user?.role === Role.ADMIN

  // Update cache
  adminCache.set(cacheKey, { isAdmin, timestamp: Date.now() })

  return isAdmin ? session : null
}

/**
 * Simple boolean check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

/**
 * Throws an error if user is not admin (for API routes)
 */
export async function requireAdmin(): Promise<void> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const adminSession = await getAdminSession()
  if (!adminSession) {
    throw new Error("Admin access required")
  }
}

/**
 * Redirects to home page if user is not admin (for pages)
 */
export async function requireAdminPage(): Promise<void> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const adminSession = await getAdminSession()
  if (!adminSession) {
    redirect("/")
  }
}

/**
 * Higher-order function to wrap API routes with admin authentication
 */
export function createAdminApiHandler(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      await requireAdmin()
      return await handler(request)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Unauthorized") {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        }
        if (error.message === "Admin access required") {
          return new Response(JSON.stringify({ error: "Admin access required" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          })
        }
      }

      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
}
