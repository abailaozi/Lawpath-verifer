/**
 * JWT Authentication Utilities
 *
 * Provides secure JWT token generation and verification using the jose library.
 * Implements industry-standard security practices with proper error handling.
 *
 * @module auth
 * @requires jose - Modern JWT library for Node.js and browsers
 */

import { SignJWT, jwtVerify } from "jose";

// JWT secret key from environment variables
// Must be set in .env.local for security
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Generates a secure JWT token for user authentication
 *
 * Creates a signed JWT token with user information and security headers.
 * Uses HS256 algorithm for compatibility and security.
 *
 * @param {string} username - The username to encode in the token
 * @returns {Promise<string>} Signed JWT token string
 * @throws {Error} If JWT_SECRET is not configured
 */
export async function signToken(username: string) {
  // Convert secret to Uint8Array for jose library
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Create and sign JWT with security best practices
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" }) // HMAC SHA-256 algorithm
    .setExpirationTime("7d") // 7-day token expiration
    .sign(secret);
}

/**
 * Verifies and decodes a JWT token
 *
 * Validates token signature, expiration, and extracts user information.
 * Returns null for invalid tokens to prevent authentication bypass.
 *
 * @param {string} token - JWT token string to verify
 * @returns {Promise<{username: string} | null>} Decoded payload or null if invalid
 */
export async function verifyToken(token: string) {
  try {
    // Convert secret to Uint8Array for verification
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verify token signature and expiration
    const { payload } = await jwtVerify(token, secret);

    // Return typed payload with username
    return payload as { username: string };
  } catch (error) {
    // Log verification failure for debugging (safe to log)
    console.log("JWT verification failed:", error);

    // Return null for invalid tokens (expired, malformed, etc.)
    return null;
  }
}
