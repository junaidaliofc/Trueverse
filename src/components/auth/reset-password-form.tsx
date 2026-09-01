"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "checking" | "ready" | "invalid" | "done";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // A valid recovery link lands here with an authenticated recovery session
  // (established by the code-exchange callback). Verify it before showing the form.
  useEffect(() => {
    let active = true;

    async function check() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (active) setStatus("invalid");
        return;
      }
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (active) setStatus(user ? "ready" : "invalid");
      } catch {
        if (active) setStatus("invalid");
      }
    }

    check();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage("Could not update your password. Your reset link may have expired.");
        return;
      }
      setStatus("done");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-6 text-center text-sm text-muted-foreground">
        Checking your reset link…
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6 text-center">
        <p className="text-sm leading-6 text-muted-foreground">
          This password reset link is invalid or has expired. Request a new one to continue.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6 text-center">
        <p className="text-base font-semibold text-foreground">Password updated successfully.</p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="h-11 rounded-2xl"
        />
      </div>

      {message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
