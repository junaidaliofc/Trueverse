import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingRelation } from "@/lib/messages";
import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead
} from "@/lib/notifications-server";
import { notificationIdSchema } from "@/lib/validators";
import { unreadCount } from "@/lib/notifications";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  const { notifications, error } = await fetchNotifications(supabase, user.id);
  if (error) {
    if (isMissingRelation(error)) {
      return NextResponse.json({ notifications: [], unread: 0, migrationRequired: true });
    }
    return jsonError(error, 500);
  }
  return NextResponse.json({ notifications, unread: unreadCount(notifications) });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  try {
    const payload = notificationIdSchema.parse(await request.json());
    const { error } = await markNotificationRead(supabase, user.id, payload.id);
    if (error) {
      if (isMissingRelation(error.message)) {
        return jsonError("Notifications are not ready. Apply migration 011_notifications.sql.", 503);
      }
      return jsonError(error.message, 400);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  try {
    const payload = notificationIdSchema.parse(await request.json());
    const { error } = await deleteNotification(supabase, user.id, payload.id);
    if (error) {
      if (isMissingRelation(error.message)) {
        return jsonError("Notifications are not ready. Apply migration 011_notifications.sql.", 503);
      }
      return jsonError(error.message, 400);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return validationError(error);
  }
}
