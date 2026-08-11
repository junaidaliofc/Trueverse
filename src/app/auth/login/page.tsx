import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in to your Trueverse account.</p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">{error}</p>
      ) : null}
      <AuthForm mode="login" />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}
