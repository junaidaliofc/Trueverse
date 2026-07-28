"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveNextPath } from "@/lib/routes";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const type = (searchParams.get("type") as "signup" | "email" | "magiclink" | null) ?? "signup";
  const destination = resolveNextPath(searchParams.get("next"));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.refresh();
    router.push(destination);
  }

  return (
    <form onSubmit={onSubmit} className="glass-card mx-auto max-w-md space-y-5 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">OTP verification</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Confirm your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the one-time password sent by Supabase Auth.
        </p>
      </div>

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
        One-time password
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 tracking-[0.4em] outline-none focus:border-teal-500"
          inputMode="numeric"
          required
        />
      </label>

      {message ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p> : null}

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify account"}
      </button>
    </form>
  );
}
