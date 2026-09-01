"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "signup" | "login";

/** Current site origin for auth email redirects (never a hardcoded localhost in prod). */
function siteOrigin() {
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
      throw new Error("Authentication is not configured.");
    }
    return createSupabaseBrowserClient();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    // Normalize the email so stray whitespace / casing never causes a false mismatch.
    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = client();

      if (mode === "signup") {
        const result = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${siteOrigin()}/auth/callback`,
            data: {
              name: name.trim(),
              full_name: name.trim()
            }
          }
        });

        if (result.error) {
          setMessage(result.error.message);
          return;
        }

        if (!result.data.session) {
          router.push(`/auth/check-email?email=${encodeURIComponent(cleanEmail)}`);
          return;
        }

        router.refresh();
        router.push("/dashboard");
        return;
      }

      const result = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (result.error) {
        // Generic, non-revealing message for authentication failures.
        setMessage("Invalid email or password.");
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass mx-auto max-w-md space-y-5 rounded-3xl p-6">
      {mode === "signup" ? (
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className="h-11 rounded-2xl"
          />
        </div>
      ) : null}

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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          {mode === "login" ? (
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="h-11 rounded-2xl"
        />
      </div>

      {message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}
