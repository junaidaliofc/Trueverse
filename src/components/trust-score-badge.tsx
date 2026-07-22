export function TrustScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
      : score >= 50
        ? "bg-teal-100 text-teal-800 ring-teal-200"
        : "bg-amber-100 text-amber-800 ring-amber-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ring-1 ${tone}`}>
      Trust {score}
    </span>
  );
}
