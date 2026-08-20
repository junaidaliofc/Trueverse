import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingRelation } from "@/lib/messages";
import { searchMessagePeople } from "@/lib/messages-server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const { people, error } = await searchMessagePeople(supabase, user.id, query);

  if (error) {
    if (isMissingRelation(error)) {
      return NextResponse.json({ people: [], migrationRequired: true });
    }
    return jsonError(error, 500);
  }

  return NextResponse.json({ people });
}
