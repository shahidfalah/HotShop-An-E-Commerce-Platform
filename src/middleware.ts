import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const protectedRoutes = ["/account", "/checkout", "/payment", "/flash-sale", "/admin"]
  const pathname = request.nextUrl.pathname

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const sessionToken = request.cookies.get("next-auth.session-token") || 
                        request.cookies.get("__Secure-next-auth.session-token")

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|login|signup|\\.well-known).*)"],
}