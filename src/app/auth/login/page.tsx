import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-600">
        New to Trueverse?{" "}
        <Link href="/auth/signup" className="font-bold text-teal-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
