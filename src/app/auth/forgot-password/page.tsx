"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  );
}

const GENERIC_SENT =
  "If an account exists for that email, we sent a password reset link. Check your inbox and spam folder.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError("Authentication is not configured.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${siteUrl()}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo
      });

      // Do not reveal whether the address is registered.
      if (resetError) {
        const text = resetError.message.toLowerCase();
        const looksLikeConfig =
          text.includes("redirect") ||
          text.includes("configured") ||
          text.includes("fetch") ||
          text.includes("network");

        if (looksLikeConfig) {
          setError(resetError.message);
          return;
        }
      }

      setMessage(GENERIC_SENT);
      setEmail("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send a reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email and we will send a reset link if it matches an account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-card mx-auto max-w-md space-y-5 rounded-3xl p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Password recovery</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Reset your password</h2>
        </div>

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

        {error ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p> : null}
        {message ? (
          <p className="rounded-2xl bg-teal-50 p-3 text-sm text-teal-900" role="status">
            {message}
          </p>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-semibold text-primary">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
