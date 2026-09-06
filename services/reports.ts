import { createClient } from "@/lib/supabase/server";
import { SOURCE_LABELS, type Bug } from "@/lib/bug-constants";

const SOURCE_COLORS: Record<Bug["source"], string> = {
  automation: "bg-red-500",
  manual: "bg-blue-500",
  user_reported: "bg-amber-500",
};

const TREND_WEEKS = 7;

export async function getReportsStats() {
  const supabase = await createClient();
  const { data: bugs } = await supabase
    .from("bugs")
    .select("status, source, created_at, updated_at");

  const allBugs = bugs ?? [];
  const totalBugs = allBugs.length;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const thisMonthCount = allBugs.filter(
    (b) => new Date(b.created_at).getTime() >= startOfThisMonth,
  ).length;
  const lastMonthCount = allBugs.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= startOfLastMonth && t < startOfThisMonth;
  }).length;
  const monthOverMonthPct =
    lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : null;

  const resolvedOrClosed = allBugs.filter((b) => b.status === "resolved" || b.status === "closed");
  const avgResolutionDays =
    resolvedOrClosed.length > 0
      ? resolvedOrClosed.reduce((sum, b) => {
          const days =
            (new Date(b.updated_at).getTime() - new Date(b.created_at).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolvedOrClosed.length
      : null;

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const trend = Array.from({ length: TREND_WEEKS }, (_, i) => {
    const weekEnd = now.getTime() - i * weekMs;
    const weekStart = weekEnd - weekMs;
    const opened = allBugs.filter((b) => {
      const t = new Date(b.created_at).getTime();
      return t >= weekStart && t < weekEnd;
    }).length;
    const closed = allBugs.filter((b) => {
      if (b.status !== "resolved" && b.status !== "closed") return false;
      const t = new Date(b.updated_at).getTime();
      return t >= weekStart && t < weekEnd;
    }).length;
    return { opened, closed };
  }).reverse();
  const maxTrendValue = Math.max(1, ...trend.flatMap((w) => [w.opened, w.closed]));

  const detectionSource = (["automation", "manual", "user_reported"] as const).map((source) => {
    const count = allBugs.filter((b) => b.source === source).length;
    return {
      label: SOURCE_LABELS[source],
      pct: totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0,
      className: SOURCE_COLORS[source],
    };
  });

  return {
    totalBugs,
    monthOverMonthPct,
    avgResolutionDays,
    trend: trend.map((w) => ({
      opened: Math.round((w.opened / maxTrendValue) * 100),
      closed: Math.round((w.closed / maxTrendValue) * 100),
    })),
    detectionSource,
    hasBugs: totalBugs > 0,
  };
}
