import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import type { HelpRequest } from "@/lib/types";
import { FeedComposer, HelpRequestCard } from "@/components/feed";

export default async function FeedPage() {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();
  const { data: requests } = await supabase
    .from("help_requests")
    .select(
      "*, profiles:profiles!help_requests_author_id_fkey(full_name, photo_url, trust_score, trueverse_id), helper:profiles!help_requests_helper_id_fkey(full_name, photo_url, trust_score, trueverse_id), community_responses(*, profiles(full_name, photo_url, trust_score, trueverse_id))"
    )
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<HelpRequest[]>();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Public community feed</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Help requests</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Post a request, let a trusted member accept it, and confirm completion. Completing a
          request automatically credits the helper with a positive interaction (+3 trust).
        </p>
      </div>

      {profile ? (
        <FeedComposer />
      ) : (
        <div className="glass-card rounded-3xl p-6 text-slate-700">
          Log in to publish, accept, or complete help requests.
        </div>
      )}

      <div className="space-y-5">
        {(requests ?? []).map((request) => (
          <HelpRequestCard key={request.id} request={request} viewerId={profile?.id ?? null} />
        ))}
      </div>
    </div>
  );
}
