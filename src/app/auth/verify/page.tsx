import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <form className="glass-card space-y-5 rounded-3xl p-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">OTP verification</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Confirm your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            Dummy verification screen for the one-time password step.
          </p>
        </div>
        <label className="block text-sm font-bold text-slate-700">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="aria@trueverse.app" />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          One-time password
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 tracking-[0.4em]" defaultValue="123456" />
        </label>
        <Link href="/dashboard" className="block rounded-2xl bg-teal-600 px-5 py-3 text-center font-bold text-white">
          Verify account
        </Link>
      </form>
    </div>
  );
}
