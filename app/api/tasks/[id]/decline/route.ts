import { NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/session";
import { declineTask, getTaskById } from "../../../../../../lib/tasks";
import { createNotification } from "../../../../../../lib/notifications";
import { sendTaskDeclinedEmail } from "../../../../../../lib/email";
import { users } from "../../../../../../lib/users";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { reason } = body || {};

  if (!reason || reason.trim() === "") {
    return NextResponse.json(
      { error: "A decline reason is required" },
      { status: 400 }
    );
  }

  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.approvalStatus !== "pending") {
    return NextResponse.json(
      { error: "Task is not pending approval" },
      { status: 400 }
    );
  }

  const declined = declineTask(id, session.id, reason);

  // Notify the member
  const member = Array.from(users.values()).find((u) => u.id === task.userId);
  if (member) {
    createNotification(
      member.id,
      "task_declined",
      `Your task "${task.title}" was declined: ${reason}`,
      id,
      task.sprintId
    );

    try {
      await sendTaskDeclinedEmail(
        member.email,
        member.name,
        task.title,
        reason
      );
    } catch (err) {
      console.error(`Failed to send decline email to ${member.email}:`, err);
    }
  }

  return NextResponse.json(declined);
}
