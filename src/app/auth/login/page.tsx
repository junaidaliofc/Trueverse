import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const signupHref = next ? `/auth/signup?next=${encodeURIComponent(next)}` : "/auth/signup";

  return (
    <div className="space-y-5">
      <AuthForm mode="login" next={next} />
      <p className="text-center text-sm text-slate-600">
        New to Trueverse?{" "}
        <Link href={signupHref} className="font-bold text-teal-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
