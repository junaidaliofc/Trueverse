import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="glass space-y-4 rounded-3xl p-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {email ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-semibold text-foreground">{email}</span>. Open it to activate
              your account, then you’ll land on your dashboard.
            </>
          ) : (
            <>
              We sent a confirmation link to your email. Open it to activate your account, then
              you’ll land on your dashboard.
            </>
          )}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          Didn’t get it? Check spam, wait a minute, then try signing up again with the same email.
        </p>
        <Button asChild>
          <Link href="/auth/login">Back to log in</Link>
        </Button>
      </div>
    </div>
  );
}
