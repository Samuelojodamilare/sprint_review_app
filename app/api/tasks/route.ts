import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { createTask, getTasksBySprintId, getPendingTasks } from "../../../../lib/tasks";
import { getSprintById } from "../../../../lib/sprints";
import { createNotification } from "../../../../lib/notifications";
import { sendTaskPendingEmail } from "../../../../lib/email";
import { users } from "../../../../lib/users";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sprintId = searchParams.get("sprintId");

  // Admins can see all tasks including pending queue
  if (session.role === "admin") {
    const pending = searchParams.get("pending");
    if (pending === "true") {
      return NextResponse.json(getPendingTasks());
    }
    if (sprintId) {
      return NextResponse.json(getTasksBySprintId(sprintId));
    }
    return NextResponse.json({ error: "Provide sprintId or pending=true" }, { status: 400 });
  }

  // Members see only their own tasks
  if (!sprintId) {
    return NextResponse.json({ error: "Missing sprintId" }, { status: 400 });
  }

  const allTasks = getTasksBySprintId(sprintId);
  const myTasks = allTasks.filter((t) => t.userId === session.id && !t.editOf);
  return NextResponse.json(myTasks);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { sprintId, title, description, points, editOf } = body || {};

  if (!sprintId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sprint = getSprintById(sprintId);
  if (!sprint || sprint.status !== "active") {
    return NextResponse.json({ error: "Sprint not found or inactive" }, { status: 404 });
  }

  const task = createTask(
    sprintId,
    session.id,
    title,
    description || "",
    Number(points) || 1,
    editOf
  );

  const isEdit = Boolean(editOf);

  // Notify all admins and send them email
  const admins = Array.from(users.values()).filter((u) => u.role === "admin");
  for (const admin of admins) {
    createNotification(
      admin.id,
      isEdit ? "task_edit_pending" : "task_pending",
      `${session.name} submitted ${isEdit ? "an edit to" : "a new task"}: "${title}"`,
      task.id,
      sprintId
    );

    try {
      await sendTaskPendingEmail(
        admin.email,
        admin.name,
        session.name,
        title,
        Number(points) || 1,
        isEdit
      );
    } catch (err) {
      console.error(`Failed to send task pending email to ${admin.email}:`, err);
    }
  }

  return NextResponse.json(task, { status: 201 });
}
