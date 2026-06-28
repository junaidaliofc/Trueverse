import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Sign in</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Return to your trust dashboard</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Prototype sign-in screen for email/password and one-time password access.
        </p>
        <div className="mt-6 grid gap-3">
          {["Email login", "OTP verification", "Session refresh"].map((item) => (
            <div key={item} className="rounded-2xl bg-white/70 p-4 font-bold text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <form className="glass-card space-y-5 rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Sign in</h2>
        <label className="block text-sm font-bold text-slate-700">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="aria@trueverse.app" />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          Password
          <input type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="password" />
        </label>
        <Link href="/dashboard" className="block rounded-2xl bg-teal-600 px-5 py-3 text-center font-bold text-white">
          Sign in
        </Link>
        <button className="w-full rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">
          Send one-time password
        </button>
        <p className="text-center text-sm text-slate-600">
          New to Trueverse?{" "}
          <Link href="/auth/signup" className="font-bold text-teal-700">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
