import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingRelation } from "@/lib/messages";
import { markAllNotificationsRead } from "@/lib/notifications-server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  const { error } = await markAllNotificationsRead(supabase, user.id);
  if (error) {
    if (isMissingRelation(error.message)) {
      return jsonError("Notifications are not ready. Apply migration 011_notifications.sql.", 503);
    }
    return jsonError(error.message, 400);
  }
  return NextResponse.json({ ok: true });
}
