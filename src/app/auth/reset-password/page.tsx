"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SessionState = "loading" | "ready" | "missing";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          if (active) {
            setSessionState("missing");
            setError("Authentication is not configured.");
          }
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (userError || !data.user) {
          setSessionState("missing");
          setError(
            "This reset link is invalid or has expired. Request a new password reset email and try again."
          );
          return;
        }

        setSessionState("ready");
      } catch {
        if (active) {
          setSessionState("missing");
          setError("Could not verify your recovery session. Request a new reset link.");
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (sessionState !== "ready") {
      setError("A valid recovery session is required before you can set a new password.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setSessionState("missing");
        setError(
          "This reset link is invalid or has expired. Request a new password reset email and try again."
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Your password was updated. You can log in with your new password.");
      setPassword("");
      setConfirm("");

      window.setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 1200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your Trueverse account.
        </p>
      </div>

      {sessionState === "loading" ? (
        <p className="text-center text-sm text-muted-foreground">Checking your recovery link…</p>
      ) : null}

      {sessionState === "missing" ? (
        <div className="glass-card space-y-4 rounded-3xl p-6 text-center">
          <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"
          >
            Request a new reset link
          </Link>
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/login" className="font-semibold text-primary">
              Back to log in
            </Link>
          </p>
        </div>
      ) : null}

      {sessionState === "ready" ? (
        <form onSubmit={onSubmit} className="glass-card mx-auto max-w-md space-y-5 rounded-3xl p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Password recovery</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Create a new password</h2>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
