import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { searchPlatform } from "@/lib/search-server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const { hits, groups, error } = await searchPlatform(supabase, q);
  if (error) return jsonError(error, 500);
  return NextResponse.json({ hits, groups });
}
