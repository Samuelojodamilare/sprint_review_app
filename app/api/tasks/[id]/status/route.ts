import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/session";
import { updateWorkStatus, getTaskById } from "../../../../../lib/tasks";
import type { WorkStatus } from "../../../../../lib/tasks";

const VALID_STATUSES: WorkStatus[] = ["todo", "in_progress", "done", "blocked"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { workStatus } = body || {};

  if (!VALID_STATUSES.includes(workStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Members can only update their own tasks; admins can update any
  if (session.role !== "admin" && task.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (task.approvalStatus !== "approved") {
    return NextResponse.json(
      { error: "Only approved tasks can have their status updated" },
      { status: 400 },
    );
  }

  const updated = updateWorkStatus(id, workStatus);
  return NextResponse.json(updated);
}
