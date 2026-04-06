import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of routes that require authentication
//const protectedRoutes = ["/profile", "/video"];
const protectedRoutes = ["/video"];

/**
 * Middleware to check authentication for protected routes
 * This runs on the server before the page is rendered
 *
 * Note: This is optional - the ProtectedRoute component already handles
 * client-side protection. Use this for additional server-side security.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a public route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for auth token in cookies or headers
  // Note: Since we store tokens in localStorage (client-side only),
  // this middleware can't access them directly.
  // You may want to store token in httpOnly cookies for server-side validation

  const token = request.cookies.get("accessToken")?.value;

  // If no token and trying to access protected route, redirect to home
  if (!token && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
