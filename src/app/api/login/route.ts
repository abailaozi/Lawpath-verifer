/**
 * Login API Route
 *
 * Handles user authentication by validating credentials and issuing JWT tokens.
 * Features input normalization, secure password comparison, and HTTP-only cookie storage.
 *
 * @route POST /api/login
 * @param {string} username - User's email address
 * @param {string} password - User's password
 * @returns {Object} Success response with authentication token
 * @returns {Object} Error response with appropriate status code
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByUsername } from "@/lib/userRepo";
import { signToken } from "@/lib/auth";

// Force Node.js runtime for bcrypt compatibility
export const runtime = "nodejs";

/**
 * POST handler for user login
 *
 * Validates user credentials, normalizes input data, and issues secure JWT tokens.
 * Implements comprehensive security measures including input sanitization and secure cookie storage.
 */
export async function POST(request: Request) {
  try {
    // Parse request body to extract credentials
    const { username, password } = await request.json();

    // Validate required fields are present
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Normalize input: trim whitespace and convert username to lowercase
    // This ensures consistent data storage and prevents duplicate accounts
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Check if normalized values are not empty after trimming
    // Prevents empty string submissions that could bypass validation
    if (!normalizedUsername || !normalizedPassword) {
      return NextResponse.json(
        { error: "Username and password cannot be empty" },
        { status: 400 }
      );
    }

    // Retrieve user from database using normalized username
    const user = await getUserByUsername(normalizedUsername);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password using bcrypt for secure comparison
    // This prevents timing attacks and ensures password security
    const isPasswordValid = await bcrypt.compare(
      normalizedPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token for authenticated session
    const token = await signToken(normalizedUsername);

    // Create response with success status
    const res = NextResponse.json({ ok: true });

    // Set secure HTTP-only cookie with JWT token
    // HTTP-only prevents XSS attacks, secure flag ensures HTTPS-only in production
    res.cookies.set("auth_token", token, {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      path: "/", // Available site-wide
      maxAge: 60 * 60 * 24 * 7, // 7 days expiration
    });

    return res;
  } catch (error) {
    // Log error for debugging while preventing information leakage
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
