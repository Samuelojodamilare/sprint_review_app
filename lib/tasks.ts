import { randomUUID } from "crypto";

export type ApprovalStatus = "pending" | "approved" | "declined";
export type WorkStatus = "todo" | "in_progress" | "done" | "blocked";

export type Task = {
  id: string;
  sprintId: string;
  userId: string;
  title: string;
  description: string;
  points: number;
  approvalStatus: ApprovalStatus;
  workStatus: WorkStatus;
  declineReason?: string;
  editOf?: string;       // if this is an edit request, references the original task id
  approvedBy?: string;   // admin user id who approved/declined
  createdAt: string;
  updatedAt: string;
};

const tasks = new Map<string, Task>();

export function createTask(
  sprintId: string,
  userId: string,
  title: string,
  description: string,
  points: number,
  editOf?: string
): Task {
  const task: Task = {
    id: randomUUID(),
    sprintId,
    userId,
    title,
    description,
    points,
    approvalStatus: "pending",
    workStatus: "todo",
    editOf,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.set(task.id, task);
  return task;
}

export function getTaskById(id: string): Task | null {
  return tasks.get(id) || null;
}

export function getTasksBySprintId(sprintId: string): Task[] {
  return Array.from(tasks.values()).filter((t) => t.sprintId === sprintId);
}

export function getTasksByUserId(userId: string): Task[] {
  return Array.from(tasks.values()).filter((t) => t.userId === userId);
}

export function getPendingTasks(): Task[] {
  return Array.from(tasks.values()).filter(
    (t) => t.approvalStatus === "pending"
  );
}

export function approveTask(taskId: string, adminId: string): Task | null {
  const task = tasks.get(taskId);
  if (!task) return null;

  // If this is an edit request, apply changes to the original and remove the edit
  if (task.editOf) {
    const original = tasks.get(task.editOf);
    if (original) {
      const updated: Task = {
        ...original,
        title: task.title,
        description: task.description,
        points: task.points,
        approvedBy: adminId,
        updatedAt: new Date().toISOString(),
      };
      tasks.set(original.id, updated);
      tasks.delete(taskId); // remove the edit request
      return updated;
    }
  }

  const updated: Task = {
    ...task,
    approvalStatus: "approved",
    approvedBy: adminId,
    updatedAt: new Date().toISOString(),
  };
  tasks.set(taskId, updated);
  return updated;
}

export function declineTask(
  taskId: string,
  adminId: string,
  reason: string
): Task | null {
  const task = tasks.get(taskId);
  if (!task) return null;
  const updated: Task = {
    ...task,
    approvalStatus: "declined",
    declineReason: reason,
    approvedBy: adminId,
    updatedAt: new Date().toISOString(),
  };
  tasks.set(taskId, updated);
  return updated;
}

export function updateWorkStatus(
  taskId: string,
  workStatus: WorkStatus
): Task | null {
  const task = tasks.get(taskId);
  if (!task || task.approvalStatus !== "approved") return null;
  const updated: Task = {
    ...task,
    workStatus,
    updatedAt: new Date().toISOString(),
  };
  tasks.set(taskId, updated);
  return updated;
}
