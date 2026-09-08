import { createClient } from "@/lib/supabase/server";
import { SOURCE_LABELS, type Bug } from "@/lib/bug-constants";

const SOURCE_COLORS: Record<Bug["source"], string> = {
  automation: "bg-red-500",
  manual: "bg-blue-500",
  user_reported: "bg-amber-500",
};

const TREND_BUCKETS = 7;

export async function getReportsStats({ from, to }: { from: Date; to: Date }) {
  const supabase = await createClient();
  const { data: bugs } = await supabase
    .from("bugs")
    .select("status, source, created_at, updated_at");

  const allBugs = bugs ?? [];

  const fromMs = from.getTime();
  const toMs = to.getTime();
  const rangeMs = Math.max(1, toMs - fromMs);

  const inRange = allBugs.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= fromMs && t < toMs;
  });
  const totalBugs = inRange.length;

  const previousFromMs = fromMs - rangeMs;
  const previousCount = allBugs.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= previousFromMs && t < fromMs;
  }).length;
  const periodOverPeriodPct =
    previousCount > 0 ? Math.round(((totalBugs - previousCount) / previousCount) * 100) : null;

  const resolvedOrClosed = inRange.filter((b) => b.status === "resolved" || b.status === "closed");
  const avgResolutionDays =
    resolvedOrClosed.length > 0
      ? resolvedOrClosed.reduce((sum, b) => {
          const days =
            (new Date(b.updated_at).getTime() - new Date(b.created_at).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolvedOrClosed.length
      : null;

  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const bucketMs = rangeMs / TREND_BUCKETS;
  const trend = Array.from({ length: TREND_BUCKETS }, (_, i) => {
    const bucketStart = fromMs + i * bucketMs;
    const bucketEnd = bucketStart + bucketMs;
    const opened = allBugs.filter((b) => {
      const t = new Date(b.created_at).getTime();
      return t >= bucketStart && t < bucketEnd;
    }).length;
    const closed = allBugs.filter((b) => {
      if (b.status !== "resolved" && b.status !== "closed") return false;
      const t = new Date(b.updated_at).getTime();
      return t >= bucketStart && t < bucketEnd;
    }).length;
    const rangeLabel = `${dateFormatter.format(new Date(bucketStart))} - ${dateFormatter.format(new Date(bucketEnd))}`;
    return { opened, closed, rangeLabel };
  });
  const maxTrendValue = Math.max(1, ...trend.flatMap((w) => [w.opened, w.closed]));

  const detectionSource = (["automation", "manual", "user_reported"] as const).map((source) => {
    const count = inRange.filter((b) => b.source === source).length;
    return {
      label: SOURCE_LABELS[source],
      count,
      pct: totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0,
      className: SOURCE_COLORS[source],
    };
  });

  return {
    totalBugs,
    periodOverPeriodPct,
    avgResolutionDays,
    trend: trend.map((w) => ({
      ...w,
      openedPct: Math.round((w.opened / maxTrendValue) * 100),
      closedPct: Math.round((w.closed / maxTrendValue) * 100),
    })),
    detectionSource,
    hasBugs: totalBugs > 0,
  };
}
