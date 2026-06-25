import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="space-y-5">
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-teal-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
