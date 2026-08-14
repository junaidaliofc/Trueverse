import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingRelation } from "@/lib/messages";
import { fetchNotifications } from "@/lib/notifications-server";
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
      return NextResponse.json({ unread: 0, migrationRequired: true });
    }
    return jsonError(error, 500);
  }
  return NextResponse.json({ unread: unreadCount(notifications) });
}
