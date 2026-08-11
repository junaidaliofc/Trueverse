import { redirect } from "next/navigation";

/** Dummy OTP verification removed for beta. */
export default function VerifyPage() {
  redirect("/auth/login");
}
