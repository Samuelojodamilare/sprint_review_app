import { randomUUID } from "crypto";

export type NotificationType =
  | "task_pending"
  | "task_edit_pending"
  | "task_approved"
  | "task_declined"
  | "sprint_created"
  | "sprint_closed";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  taskId?: string;
  sprintId?: string;
  read: boolean;
  createdAt: string;
};

const notifications = new Map<string, Notification>();

export function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string,
  sprintId?: string
): Notification {
  const notification: Notification = {
    id: randomUUID(),
    userId,
    type,
    message,
    taskId,
    sprintId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.set(notification.id, notification);
  return notification;
}

export function getNotificationsByUserId(userId: string): Notification[] {
  return Array.from(notifications.values())
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function markAsRead(notificationId: string): boolean {
  const n = notifications.get(notificationId);
  if (!n) return false;
  notifications.set(notificationId, { ...n, read: true });
  return true;
}

export function markAllAsRead(userId: string): void {
  for (const [id, n] of notifications.entries()) {
    if (n.userId === userId) {
      notifications.set(id, { ...n, read: true });
    }
  }
}

export function getUnreadCount(userId: string): number {
  return Array.from(notifications.values()).filter(
    (n) => n.userId === userId && !n.read
  ).length;
}
