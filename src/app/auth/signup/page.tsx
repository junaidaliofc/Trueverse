import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join Trueverse and start building portable reputation signals.
        </p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
