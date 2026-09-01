"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  );
}

const NEUTRAL_MESSAGE =
  "If an account exists for that email, we've sent password reset instructions.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createSupabaseBrowserClient();
        // Recovery links flow through the project's existing code-exchange callback.
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${siteOrigin()}/auth/callback?next=/auth/reset-password`
        });
      }
    } catch {
      // Never reveal whether the email exists or any provider error.
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6 text-center">
        <p className="text-sm leading-6 text-muted-foreground">{NEUTRAL_MESSAGE}</p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="h-11 rounded-2xl"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
