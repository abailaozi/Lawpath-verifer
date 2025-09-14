import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByUsername } from "@/lib/userRepo";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const user = await getUserByUsername(normalizedUsername);
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const isPasswordValid = await bcrypt.compare(
      normalizedPassword,
      user.passwordHash
    );
    if (!isPasswordValid)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const token = signToken(normalizedUsername);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_token", token, {
      httpOnly: true,

      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
