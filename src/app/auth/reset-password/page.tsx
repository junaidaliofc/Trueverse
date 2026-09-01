import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter a new password for your Trueverse account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
