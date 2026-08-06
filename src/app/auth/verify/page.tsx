import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/verify-otp-form";

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the one-time code we sent you.</p>
      </div>
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
