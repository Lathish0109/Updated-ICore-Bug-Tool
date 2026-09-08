import { createClient } from "@/lib/supabase/server";
import { PRIORITY_LABELS, type Bug } from "@/lib/bug-constants";

const BUG_STATUS_STYLES: Record<Bug["status"], string> = {
  open: "bg-red-500",
  in_progress: "bg-amber-500",
  resolved: "bg-blue-500",
  closed: "bg-slate-400",
};

const TREND_BUCKETS = 10;

export async function getDashboardStats({ trendDays = 30 }: { trendDays?: number } = {}) {
  const bucketSizeDays = trendDays / TREND_BUCKETS;
  const supabase = await createClient();

  const [{ count: totalProjects }, { count: activeUsers }, { data: bugs }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("bugs").select("status, priority, created_at, updated_at"),
  ]);

  const allBugs = bugs ?? [];

  const bugBreakdown = (["open", "in_progress", "resolved"] as const).map((status) => ({
    status,
    label: status === "in_progress" ? "In Prog" : status === "open" ? "Open" : "Resolved",
    count: allBugs.filter((b) => b.status === status).length,
    className: BUG_STATUS_STYLES[status],
  }));
  const totalActiveBugs = bugBreakdown.reduce((sum, b) => sum + b.count, 0);

  const priorityBreakdown = (["p1", "p2", "p3", "p4"] as const).map((priority) => {
    const count = allBugs.filter((b) => b.priority === priority).length;
    return {
      priority,
      label: PRIORITY_LABELS[priority],
      count,
      pct: allBugs.length > 0 ? Math.round((count / allBugs.length) * 100) : 0,
    };
  });

  const now = Date.now();
  const resolutionTrend = Array.from({ length: TREND_BUCKETS }, (_, i) => {
    const bucketEnd = now - i * bucketSizeDays * 24 * 60 * 60 * 1000;
    const bucketStart = bucketEnd - bucketSizeDays * 24 * 60 * 60 * 1000;
    return allBugs.filter((b) => {
      if (b.status !== "resolved") return false;
      const t = new Date(b.updated_at).getTime();
      return t >= bucketStart && t < bucketEnd;
    }).length;
  }).reverse();
  const maxTrend = Math.max(1, ...resolutionTrend);

  return {
    totalProjects: totalProjects ?? 0,
    activeUsers: activeUsers ?? 0,
    bugBreakdown,
    totalActiveBugs,
    priorityBreakdown,
    resolutionTrend: resolutionTrend.map((count) => Math.round((count / maxTrend) * 100)),
    hasBugs: allBugs.length > 0,
  };
}
