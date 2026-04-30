import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "../../../../lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const user = createUser(name || "", email, password);
    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
