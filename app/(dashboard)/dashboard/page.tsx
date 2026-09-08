import type { ReactNode } from "react";

import Link from "next/link";
import { Bug, FolderKanban, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { HoverTooltip } from "@/components/shared/hover-tooltip";
import { RangeSelector } from "@/components/shared/range-selector";
import { displayId, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/bug-constants";
import { resolveRange } from "@/lib/date-range";
import { getBugs } from "@/services/bugs";
import { getDashboardStats } from "@/services/dashboard";

const priorityStyles: Record<string, string> = {
  p1: "bg-red-600 text-white",
  p2: "bg-red-100 text-red-700",
  p3: "bg-blue-100 text-blue-700",
  p4: "bg-slate-100 text-slate-600",
};

const statusStyles: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-blue-50 text-blue-600",
  resolved: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
};

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-border bg-card min-w-0 rounded-lg border p-5 ${className}`}>
      {children}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const params = await searchParams;
  const range = resolveRange(typeof params.range === "string" ? params.range : undefined);
  const [stats, { bugs: recentBugs }] = await Promise.all([
    getDashboardStats({ trendDays: range.days }),
    getBugs({ pageSize: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          High-level metrics and recent activity across all projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Total Projects</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalProjects}</p>
          </div>
          <FolderKanban className="text-muted-foreground size-5" />
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Active Users</p>
            <p className="mt-1 text-3xl font-semibold">{stats.activeUsers}</p>
          </div>
          <Users className="text-muted-foreground size-5" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Total Active Bugs</p>
            <Bug className="text-muted-foreground size-5" />
          </div>
          <p className="mt-1 text-3xl font-semibold">{stats.totalActiveBugs.toLocaleString()}</p>
          {stats.totalActiveBugs > 0 ? (
            <>
              <div className="border-border mt-3 flex h-2 overflow-hidden rounded-full border">
                {stats.bugBreakdown.map(({ label, count, className }) => (
                  <HoverTooltip
                    key={label}
                    label={`${label}: ${count}`}
                    style={{ width: `${(count / stats.totalActiveBugs) * 100}%` }}
                  >
                    <div className={`h-2 w-full ${className}`} />
                  </HoverTooltip>
                ))}
              </div>
              <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {stats.bugBreakdown.map(({ label, count, className }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={`size-2 rounded-full ${className}`} />
                    {label} ({count})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-3 text-xs">No bugs reported yet.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Bugs by Priority
          </p>
          {!stats.hasBugs ? (
            <p className="text-muted-foreground mt-4 text-sm">No bugs to summarize yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.priorityBreakdown.map(({ label, count, pct }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <HoverTooltip label={`${label}: ${count} (${pct}%)`} className="block">
                    <div className="bg-accent h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </HoverTooltip>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Resolution Trend
            </p>
            <RangeSelector basePath="/dashboard" value={range.value} />
          </div>
          {stats.hasBugs ? (
            <div className="mt-4 flex h-32 items-end gap-1.5">
              {stats.resolutionTrend.map((bucket, i) => (
                <HoverTooltip
                  key={i}
                  label={`${bucket.rangeLabel}: ${bucket.count} resolved`}
                  className="flex h-full flex-1 items-end"
                >
                  <div
                    className="min-h-0.5 w-full rounded-t-sm bg-red-500"
                    style={{ height: `${Math.max(bucket.pct, 2)}%` }}
                  />
                </HoverTooltip>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">No resolved bugs yet.</p>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Recent Bugs
          </p>
          <Link href="/bugs" className="text-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        {recentBugs.length === 0 ? (
          <EmptyState
            icon={Bug}
            title="No bugs reported yet"
            description="Bugs you create will show up here."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-border border-y text-left text-xs">
                  <th className="px-5 py-2 font-medium">ID</th>
                  <th className="px-5 py-2 font-medium">Title</th>
                  <th className="px-5 py-2 font-medium">Project</th>
                  <th className="px-5 py-2 font-medium">Priority</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentBugs.map((bug) => (
                  <tr key={bug.id} className="border-border border-b last:border-0">
                    <td className="text-muted-foreground px-5 py-3 font-mono text-xs">
                      <Link href={`/bugs/${bug.id}`} className="hover:underline">
                        {displayId(bug.projectKey, bug.sequence_number)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/bugs/${bug.id}`} className="hover:underline">
                        {bug.title}
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-5 py-3">{bug.projectName}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-transparent ${priorityStyles[bug.priority]}`}
                      >
                        {PRIORITY_LABELS[bug.priority]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-transparent ${statusStyles[bug.status]}`}
                      >
                        {STATUS_LABELS[bug.status]}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-5 py-3 capitalize">
                      {bug.source.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="h-5" />
      </Card>
    </div>
  );
}
