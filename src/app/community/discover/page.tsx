import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { CommunityDiscovery } from "@/components/community/community-discovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover communities",
  description: "Find Trueverse communities by topic, neighborhood, and interest."
};

export default async function CommunityDiscoverPage({
  searchParams
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  await requireProfile();
  const { topic } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <CommunityDiscovery initialTopic={topic} />
    </div>
  );
}
