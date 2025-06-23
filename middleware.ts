import { getToken } from 'next-auth/jwt';
import withAuth from 'next-auth/middleware'
import { NextResponse, NextRequest } from 'next/server'

export default withAuth(async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAuth= await getToken({ req: request });
    const protectedRoute = ["/checkout", "/payment", "/account", "products"];
    // const isAuthRoute = pathname.startsWith("/auth/signup"); //,"/auth/login"
    const isProtectedRoute = protectedRoute.some(route => 
      pathname.startsWith(route)
    );

    if(!isAuth && isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  },{
    callbacks: {
      async authorized({ token }) {
        return !!token; // Return true if the user is authenticated, false otherwise
      }
    }
  }
)


export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/checkout",
    "/payment",
    "/account/:path*", 
    "products/:path*",
],
};
