"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio);
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        bio,
        photo_url: photoUrl
      })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error ?? "Unable to update profile.");
      return;
    }

    setMessage("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-5 rounded-3xl p-6">
      <h2 className="text-xl font-black text-slate-950">Edit profile</h2>

      <label className="block text-sm font-semibold text-slate-700">
        Name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          required
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Photo URL
        <input
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          placeholder="https://..."
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Bio
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          maxLength={280}
        />
      </label>

      {message ? <p className="rounded-2xl bg-teal-50 p-3 text-sm text-teal-800">{message}</p> : null}

      <button
        disabled={loading}
        className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
