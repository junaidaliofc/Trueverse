"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "signup" | "login";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function client() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase is not configured.");
    }
    return createSupabaseBrowserClient();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = client();
      const emailRedirectTo = `${siteUrl()}/auth/callback`;

      if (mode === "signup") {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: {
              name,
              full_name: name
            }
          }
        });

        if (result.error) {
          setMessage(result.error.message);
          return;
        }

        // Email confirmation required — never open a fake OTP screen.
        if (!result.data.session) {
          router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
          return;
        }

        router.refresh();
        router.push("/dashboard");
        return;
      }

      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card mx-auto max-w-md space-y-5 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {mode === "signup" ? "Join Trueverse" : "Log in to Trueverse"}
        </h1>
      </div>

      {mode === "signup" ? (
        <label className="block text-sm font-semibold text-slate-700">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
            required
            autoComplete="name"
          />
        </label>
      ) : null}

      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          required
          autoComplete="email"
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </label>

      {message ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p> : null}

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Log in"}
      </button>
    </form>
  );
}
