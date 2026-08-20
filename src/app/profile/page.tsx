import { redirect } from "next/navigation";

/** Profile editing lives on Passport — keep /profile as a stable redirect. */
export default function ProfileRedirectPage() {
  redirect("/passport");
}
