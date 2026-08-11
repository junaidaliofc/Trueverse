import Link from "next/link";

export default async function CheckEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="glass-card space-y-4 rounded-3xl p-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Beta</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">
          Check your email
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {email ? (
            <>
              We sent a confirmation link to <span className="font-semibold text-slate-900">{email}</span>.
              Open it to activate your account, then you’ll land on your dashboard.
            </>
          ) : (
            <>
              We sent a confirmation link to your email. Open it to activate your account, then
              you’ll land on your dashboard.
            </>
          )}
        </p>
        <p className="text-xs leading-5 text-slate-500">
          Didn’t get it? Check spam, wait a minute, then try signing up again with the same email.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"
        >
          Back to log in
        </Link>
      </div>
    </div>
  );
}
