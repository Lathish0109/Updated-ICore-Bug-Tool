import type { ReactNode } from "react";

import { TrendingDown, TrendingUp } from "lucide-react";

import { getReportsStats } from "@/services/reports";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-border bg-card min-w-0 rounded-lg border p-5 ${className}`}>
      {children}
    </div>
  );
}

export default async function ReportsPage() {
  const stats = await getReportsStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Project Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Comprehensive overview of issue tracking performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Total Bugs
          </p>
          <p className="mt-1 text-3xl font-semibold">{stats.totalBugs.toLocaleString()}</p>
          {stats.monthOverMonthPct === null ? (
            <p className="text-muted-foreground mt-1 text-sm">Not enough history yet</p>
          ) : (
            <p
              className={`mt-1 flex items-center gap-1 text-sm ${
                stats.monthOverMonthPct <= 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {stats.monthOverMonthPct <= 0 ? (
                <TrendingDown className="size-4" />
              ) : (
                <TrendingUp className="size-4" />
              )}
              {Math.abs(stats.monthOverMonthPct)}% vs last month
            </p>
          )}
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Avg. Resolution Time
          </p>
          <p className="mt-1 text-3xl font-semibold">
            {stats.avgResolutionDays === null ? "—" : `${stats.avgResolutionDays.toFixed(1)} days`}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {stats.avgResolutionDays === null
              ? "No resolved bugs yet"
              : "Across all active projects"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Trend: Bugs Opened vs Closed
          </p>
          {stats.hasBugs ? (
            <>
              <div className="mt-4 flex h-40 items-end gap-3">
                {stats.trend.map((week, i) => (
                  <div key={i} className="flex h-full flex-1 items-end gap-0.5">
                    <div
                      className="min-h-0.5 flex-1 rounded-t-sm bg-red-300"
                      style={{ height: `${Math.max(week.opened, 2)}%` }}
                    />
                    <div
                      className="min-h-0.5 flex-1 rounded-t-sm bg-emerald-400"
                      style={{ height: `${Math.max(week.closed, 2)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-3 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-300" /> Opened
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400" /> Closed
                </span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">No bugs to chart yet.</p>
          )}
        </Card>

        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Detection Source
          </p>
          {stats.hasBugs ? (
            <div className="mt-4 space-y-3">
              {stats.detectionSource.map(({ label, pct, className }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="bg-accent h-2 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full ${className}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">No bugs to summarize yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
