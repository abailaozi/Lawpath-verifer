/**
 * Next.js Middleware for Authentication
 *
 * Protects the address verification page by checking for valid JWT tokens.
 * Redirects unauthenticated users to the login page and validates token integrity.
 *
 * @module middleware
 * @requires NextRequest, NextResponse from Next.js
 * @requires verifyToken from auth utilities
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Authentication middleware function
 *
 * Intercepts requests to protected routes and validates authentication.
 * Only allows access to /verifier routes with valid JWT tokens.
 *
 * @param {NextRequest} req - The incoming request object
 * @returns {Promise<NextResponse>} Response with redirect or continuation
 */
export async function middleware(req: NextRequest) {
  // Check if the request is for a protected route
  if (req.nextUrl.pathname.startsWith("/verifier")) {
    // Extract JWT token from HTTP-only cookie
    const token = req.cookies.get("auth_token")?.value;

    // Redirect to login if no token is present
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Verify token validity and extract user information
    const verified = await verifyToken(token);

    // Redirect to login if token is invalid or expired
    if (!verified) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Allow request to continue if authentication passes
  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Defines which routes should be processed by this middleware.
 * Only /verifier routes require authentication.
 */
export const config = {
  matcher: ["/verifier/:path*"],
};
