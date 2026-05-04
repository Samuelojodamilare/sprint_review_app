import { NextResponse } from "next/server";
import { getSession } from "../../../lib/session";
import { createSprint, getAllSprints } from "../../../lib/sprints";
import { createNotification } from "../../../lib/notifications";
import { sendSprintCreatedEmail } from "../../../lib/email";
import { users } from "../../../lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  return NextResponse.json(getAllSprints());
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, goal, startDate, endDate } = body || {};

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const sprint = createSprint(name, goal || "", startDate, endDate, session.id);

  // Notify all members and send them an email
  const allUsers = Array.from(users.values());
  for (const user of allUsers) {
    createNotification(
      user.id,
      "sprint_created",
      `A new sprint has started: ${name}`,
      undefined,
      sprint.id,
    );

    try {
      await sendSprintCreatedEmail(
        user.email,
        user.name,
        name,
        goal || "",
        startDate,
        endDate,
      );
    } catch (err) {
      console.error(`Failed to send sprint email to ${user.email}:`, err);
    }
  }

  return NextResponse.json(sprint, { status: 201 });
}
