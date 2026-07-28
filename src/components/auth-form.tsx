"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveNextPath } from "@/lib/routes";

type AuthMode = "signup" | "login";

export function AuthForm({ mode, next }: { mode: AuthMode; next?: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = resolveNextPath(next);

  function buildCallbackUrl() {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", destination);
    return url.toString();
  }

  function verifyUrl(type: "signup" | "email") {
    const params = new URLSearchParams({ email, type, next: destination });
    return `/auth/verify?${params.toString()}`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const callbackUrl = buildCallbackUrl();
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: callbackUrl,
              data: { full_name: fullName }
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      router.push(verifyUrl("signup"));
      return;
    }

    router.refresh();
    router.push(destination);
  }

  async function sendOtp() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "signup",
        emailRedirectTo: buildCallbackUrl()
      }
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(verifyUrl("email"));
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
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
            required
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
        />
      </label>

      {message ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p> : null}

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Log in"}
      </button>

      <button
        type="button"
        disabled={!email || loading}
        onClick={sendOtp}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:border-teal-500 disabled:opacity-60"
      >
        Send one-time password
      </button>
    </form>
  );
}
