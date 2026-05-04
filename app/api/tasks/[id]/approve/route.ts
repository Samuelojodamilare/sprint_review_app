import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/session";
import { approveTask, getTaskById } from "../../../../../lib/tasks";
import { createNotification } from "../../../../../lib/notifications";
import { sendTaskApprovedEmail } from "../../../../../lib/email";
import { findUserByEmail, users } from "../../../../../lib/users";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.approvalStatus !== "pending") {
    return NextResponse.json(
      { error: "Task is not pending approval" },
      { status: 400 },
    );
  }

  const approved = approveTask(id, session.id);

  // Notify the member
  const member = Array.from(users.values()).find((u) => u.id === task.userId);
  if (member) {
    createNotification(
      member.id,
      "task_approved",
      `Your task "${task.title}" has been approved`,
      approved?.id,
      task.sprintId,
    );

    try {
      await sendTaskApprovedEmail(member.email, member.name, task.title);
    } catch (err) {
      console.error(`Failed to send approval email to ${member.email}:`, err);
    }
  }

  return NextResponse.json(approved);
}
