import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appealCreateSchema } from "@/lib/validators";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  const query = supabase
    .from("moderation_appeals")
    .select("id, reason, status, target_table, created_at, resolution_notes, appellant_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data, error } =
    profile?.role === "admin" ? await query : await query.eq("appellant_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ appeals: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  try {
    const payload = appealCreateSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("moderation_appeals")
      .insert({
        appellant_id: user.id,
        target_table: payload.target_table,
        target_id: payload.target_id,
        reason: payload.reason
      })
      .select("*")
      .single();
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ appeal: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
