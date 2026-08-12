import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const { ensureProfile } = await import("@/lib/auth");
    const profile = await ensureProfile(supabase, user);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load profile.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const limited = rateLimit(`profile:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return jsonError("Too many profile updates. Try again shortly.", 429);
  }

  try {
    const payload = profileUpdateSchema.parse(await request.json());

    if (payload.username) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", payload.username)
        .neq("id", user.id)
        .maybeSingle();

      if (taken) {
        return jsonError("That username is already taken.", 409);
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: payload.full_name,
        bio: payload.bio,
        photo_url: payload.photo_url || null,
        ...(payload.username ? { username: payload.username } : {}),
        city: payload.city || null,
        headline: payload.headline || null,
        interests: payload.interests
          ? payload.interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 12)
          : [],
        social_links: {
          ...(payload.website ? { website: payload.website } : {}),
          ...(payload.linkedin ? { linkedin: payload.linkedin } : {})
        }
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonError("That username is already taken.", 409);
      }
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return validationError(error);
  }
}
