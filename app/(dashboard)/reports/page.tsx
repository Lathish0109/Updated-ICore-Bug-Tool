import type { ReactNode } from "react";

import { TrendingDown } from "lucide-react";

const trend = [
  { opened: 60, closed: 40 },
  { opened: 45, closed: 50 },
  { opened: 70, closed: 55 },
  { opened: 55, closed: 65 },
  { opened: 80, closed: 60 },
  { opened: 50, closed: 75 },
  { opened: 65, closed: 80 },
];

const detectionSource = [
  { label: "Automated Tests", pct: 62, className: "bg-red-500" },
  { label: "Manual QA", pct: 28, className: "bg-blue-500" },
  { label: "User Reported", pct: 10, className: "bg-amber-500" },
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-border bg-card rounded-lg border p-5 ${className}`}>{children}</div>
  );
}

export default function ReportsPage() {
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
          <p className="mt-1 text-3xl font-semibold">1,248</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-emerald-600">
            <TrendingDown className="size-4" /> 12% vs last month
          </p>
        </Card>
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Avg. Resolution Time
          </p>
          <p className="mt-1 text-3xl font-semibold">3.4 days</p>
          <p className="text-muted-foreground mt-1 text-sm">Across all active projects</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Trend: Bugs Opened vs Closed
          </p>
          <div className="mt-4 flex h-40 items-end gap-3">
            {trend.map((week, i) => (
              <div key={i} className="flex h-full flex-1 items-end gap-0.5">
                <div
                  className="flex-1 rounded-t-sm bg-red-300"
                  style={{ height: `${week.opened}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-emerald-400"
                  style={{ height: `${week.closed}%` }}
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
        </Card>

        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Detection Source
          </p>
          <div className="mt-4 space-y-3">
            {detectionSource.map(({ label, pct, className }) => (
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
        </Card>
      </div>
    </div>
  );
}
