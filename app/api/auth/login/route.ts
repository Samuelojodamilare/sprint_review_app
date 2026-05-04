import { NextResponse } from "next/server";
import { findUserByEmail, hashPassword } from "../../../../lib/users";
import { createToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const hash = hashPassword(password, user.salt);
    if (hash !== user.hash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create a JWT token with the user's id, name, email and role
    const token = await createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 200 }
    );

    // Set the token as a secure httpOnly cookie — the client cannot tamper with this
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
