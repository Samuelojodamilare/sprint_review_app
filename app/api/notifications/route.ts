import { NextResponse } from "next/server";
import { getSession } from "../../../lib/session";
import {
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../../../lib/notifications";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const notifications = getNotificationsByUserId(session.id);
  const unreadCount = getUnreadCount(session.id);
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { notificationId, markAll } = body || {};

  if (markAll) {
    markAllAsRead(session.id);
    return NextResponse.json({ success: true });
  }

  if (notificationId) {
    const success = markAsRead(notificationId);
    return NextResponse.json({ success });
  }

  return NextResponse.json(
    { error: "Missing notificationId or markAll" },
    { status: 400 },
  );
}
