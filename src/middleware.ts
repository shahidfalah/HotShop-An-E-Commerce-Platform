import { withAuth } from 'next-auth/middleware'; // Import withAuth
import { NextResponse } from 'next/server'; // Keep NextResponse

// Define your middleware logic here
export default withAuth(
  async function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const userRole = request.nextauth.token?.role; // Access role from the token

    // Define paths that require specific roles
    const adminProtectedRoutes = ["/admin"]; // Only admin can access /admin and its sub-paths

    // Check for admin-only routes
    if (adminProtectedRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== "ADMIN") {
        // Redirect non-admin users from admin routes
        return NextResponse.redirect(new URL("/", request.url)); // Redirect to homepage or a suitable error page
      }
    }

    // You can add other role-based checks here if needed
    // e.g., if (pathname.startsWith("/editor") && userRole !== "EDITOR") { ... }

    return NextResponse.next(); // Continue to the requested page
  },
  {
    // Callbacks for withAuth
    callbacks: {
      async authorized({ token, req }) {
        // This callback determines if the user is authenticated for the routes defined in 'matcher'.
        // It's called BEFORE the middleware function itself.
        // If it returns false, NextAuth.js redirects to the signIn page.

        // Paths that should NOT require authentication (public routes)
        const publicPaths = ["/", "/login", "/signup"]; // Add any other public paths
        
        // If the path is a public path, always allow access
        if (publicPaths.some(path => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`))) {
          return true;
        }

        // For all other paths in the matcher, require a token (i.e., user must be logged in)
        return !!token;
      },
    },
    // Define the pages where NextAuth.js should redirect unauthenticated users
    pages: {
      signIn: "/login", // Ensure this matches your signIn page path
    },
  }
);

// The matcher configures which paths the middleware should run on.
// It applies to all routes that need any form of authentication or role-based check.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need auth check in middleware, or handle auth internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any files in the root (e.g., /logo.svg, /defaultProfileImage.jpeg)
     *
     * We explicitly list the paths we want to protect or handle.
     * Ensure this list covers all pages where you need authentication or role checks.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|logo.svg|defaultProfileImage.jpeg|\\.well-known).*)",
    // Explicitly include paths that might not be caught by the general regex
    // or if you want to be very specific:
    // "/", // Homepage
    // "/products/:path*", // All product pages
    // "/categories/:path*", // All category pages
    "/checkout",
    "/account/:path*",
    "/products/:path*",
    "/admin/:path*", // Protect all admin sub-paths
    "/cart", // Assuming cart also requires login
  ],
};
