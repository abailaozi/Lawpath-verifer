/**
 * Current User API Endpoint
 *
 * Returns the current authenticated user's information.
 * Verifies JWT token and returns user data.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Return user information
    return NextResponse.json({
      username: user.username,
    });
  } catch (error) {
    console.error("User info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
