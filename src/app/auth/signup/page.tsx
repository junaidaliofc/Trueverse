import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Sign up</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Create your portable trust identity</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Prototype signup flow for email account creation, profile setup, and OTP verification.
        </p>
        <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-200">Starting score</p>
          <p className="mt-3 text-5xl font-black">50</p>
          <p className="mt-2 text-slate-300">Every new member starts neutral and earns reputation through verified interactions.</p>
        </div>
      </section>

      <form className="glass-card space-y-5 rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Join Trueverse</h2>
        <label className="block text-sm font-bold text-slate-700">
          Name
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="Aria Morgan" />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="aria@trueverse.app" />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          Password
          <input type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue="password" />
        </label>
        <Link href="/auth/verify?email=aria%40trueverse.app&type=signup" className="block rounded-2xl bg-teal-600 px-5 py-3 text-center font-bold text-white">
          Create account
        </Link>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-teal-700">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
