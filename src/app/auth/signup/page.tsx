import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const loginHref = next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login";

  return (
    <div className="space-y-5">
      <AuthForm mode="signup" next={next} />
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={loginHref} className="font-bold text-teal-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
