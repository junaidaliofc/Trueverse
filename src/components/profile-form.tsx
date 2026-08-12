"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const links = profile.social_links ?? {};
  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(
    profile.username ?? profile.trueverse_id.replace(/^tv_/, "")
  );
  const [bio, setBio] = useState(profile.bio);
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [interests, setInterests] = useState((profile.interests ?? []).join(", "));
  const [website, setWebsite] = useState(links.website ?? "");
  const [linkedin, setLinkedin] = useState(links.linkedin ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        username,
        bio,
        photo_url: photoUrl,
        city,
        headline,
        interests,
        website,
        linkedin
      })
    });

    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update profile.");
      return;
    }

    setMessage("Profile saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-[1.75rem] p-5 sm:p-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          Complete your Passport
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Public identity details only. Email and private data stay private.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Display name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            minLength={2}
            maxLength={80}
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            required
            minLength={3}
            maxLength={24}
            pattern="[a-z0-9_]{3,24}"
            autoComplete="username"
            className="h-11 rounded-2xl"
          />
          <p className="text-xs text-muted-foreground">/u/{username || "username"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo_url">Profile photo URL</Label>
          <Input
            id="photo_url"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="https://"
            inputMode="url"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="headline">Occupation / headline</Label>
          <Input
            id="headline"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            maxLength={120}
            placeholder="Community organizer"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City / location</Label>
          <Input
            id="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={80}
            placeholder="Austin, TX"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interests</Label>
          <Input
            id="interests"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="mutual aid, volunteering"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={280}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
            className="h-11 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn (optional)</Label>
          <Input
            id="linkedin"
            value={linkedin}
            onChange={(event) => setLinkedin(event.target.value)}
            placeholder="https://"
            className="h-11 rounded-2xl"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-2xl bg-success-soft px-3 py-2 text-sm text-success">{message}</p>
      ) : null}

      <Button type="submit" disabled={loading} className="min-h-11 w-full sm:w-auto">
        {loading ? "Saving…" : "Save Passport"}
      </Button>
    </form>
  );
}
