import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { communityReactionSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

/**
 * Toggle a social reaction. Must NEVER mutate trust_score / trust_index.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const payload = communityReactionSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const limited = rateLimit(`community-react:${user.id}`, 60, 60_000);
    if (!limited.ok) return jsonError("Too many reactions. Try again shortly.", 429);

    const { data: existing } = await supabase
      .from("community_reactions")
      .select("id")
      .eq("post_id", id)
      .eq("profile_id", user.id)
      .eq("reaction_type", payload.reaction_type)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("community_reactions")
        .delete()
        .eq("id", existing.id);
      if (error) return jsonError(error.message, 500);
      return NextResponse.json({
        ok: true,
        active: false,
        reaction_type: payload.reaction_type,
        note: "Reactions do not change trust."
      });
    }

    const { error } = await supabase.from("community_reactions").insert({
      post_id: id,
      profile_id: user.id,
      reaction_type: payload.reaction_type
    });

    if (error) return jsonError(error.message, 500);

    return NextResponse.json({
      ok: true,
      active: true,
      reaction_type: payload.reaction_type,
      note: "Reactions do not change trust."
    });
  } catch (error) {
    return validationError(error);
  }
}
