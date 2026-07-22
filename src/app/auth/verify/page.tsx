import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/verify-otp-form";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
