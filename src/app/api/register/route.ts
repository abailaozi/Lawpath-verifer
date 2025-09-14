import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "@/lib/userRepo";
import { ensureIndices } from "@/lib/elastic";
export const runtime = "nodejs";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\\w\\s]).{8,}$/;
export async function POST(request: Request) {
  await ensureIndices();
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Normalize input: trim whitespace and convert username to lowercase
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Check if normalized values are not empty after trimming
    if (!normalizedUsername || !normalizedPassword) {
      return NextResponse.json(
        { error: "Username and password cannot be empty" },
        { status: 400 }
      );
    }
    if (!emailRegex.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    if (!passwordRegex.test(normalizedPassword)) {
      return NextResponse.json(
        { error: "Password must be 8+ chars incl. upper/lower/number/special" },
        { status: 400 }
      );
    }
    const exists = await getUserByUsername(normalizedUsername);
    if (exists)
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    await createUser({
      username: normalizedUsername,
      passwordHash: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
