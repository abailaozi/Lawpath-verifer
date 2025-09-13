import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByUsername, createUser } from "@/lib/userRepo";
import { ensureIndices } from "@/lib/elastic";
export const runtime = "nodejs";

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

    const exists = await getUserByUsername(username);
    if (exists)
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ username, passwordHash: hashedPassword });

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
