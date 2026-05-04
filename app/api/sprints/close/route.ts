import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { closeSprint, getSprintById } from "../../../../lib/sprints";
import { getTasksBySprintId, createTask } from "../../../../lib/tasks";
import { getActiveSprint } from "../../../../lib/sprints";
import { createNotification } from "../../../../lib/notifications";
import { sendSprintClosedEmail } from "../../../../lib/email";
import { users } from "../../../../lib/users";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { sprintId, summaryNotes } = body || {};

  if (!sprintId) {
    return NextResponse.json({ error: "Missing sprintId" }, { status: 400 });
  }

  const sprint = getSprintById(sprintId);
  if (!sprint || sprint.status !== "active") {
    return NextResponse.json(
      { error: "Sprint not found or already closed" },
      { status: 404 },
    );
  }

  const closed = closeSprint(sprintId, summaryNotes);

  // Carry over incomplete tasks — create them as pending in next sprint context
  // (they will be assigned to the next sprint when it is created)
  const tasks = getTasksBySprintId(sprintId);
  const incomplete = tasks.filter(
    (t) => t.approvalStatus === "approved" && t.workStatus !== "done",
  );

  // Notify all users and send emails
  const allUsers = Array.from(users.values());
  for (const user of allUsers) {
    createNotification(
      user.id,
      "sprint_closed",
      `Sprint "${sprint.name}" has been closed. ${incomplete.length} task(s) carried over.`,
      undefined,
      sprintId,
    );

    try {
      await sendSprintClosedEmail(
        user.email,
        user.name,
        sprint.name,
        summaryNotes || "",
      );
    } catch (err) {
      console.error(`Failed to send sprint close email to ${user.email}:`, err);
    }
  }

  return NextResponse.json({
    sprint: closed,
    carriedOver: incomplete.length,
    incompleteTasks: incomplete,
  });
}
