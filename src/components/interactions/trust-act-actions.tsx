"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TrustActActions({ interactionId }: { interactionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function act(kind: "accept" | "reject") {
    setLoading(kind);
    setError("");
    const response = await fetch(`/api/interactions/positive/${interactionId}/${kind}`, {
      method: "POST"
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(null);
    if (!response.ok) {
      setError(payload.error ?? `Unable to ${kind} this Trust Act.`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading !== null} onClick={() => act("accept")}>
          {loading === "accept" ? "Accepting…" : "Accept"}
        </Button>
        <Button
          variant="outline"
          disabled={loading !== null}
          onClick={() => act("reject")}
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </Button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
