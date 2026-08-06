import { redirect } from "next/navigation";

/** Legacy feed deferred — use Community + Activity. */
export default function FeedPage() {
  redirect("/community");
}
