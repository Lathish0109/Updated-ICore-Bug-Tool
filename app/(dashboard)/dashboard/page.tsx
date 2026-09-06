import type { ReactNode } from "react";

import Link from "next/link";
import { Bug, FolderKanban, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const overviewStats = [
  { label: "Total Projects", value: "42", icon: FolderKanban },
  { label: "Active Users", value: "128", icon: Users },
];

const bugBreakdown = [
  { label: "Open", value: 450, className: "bg-red-500" },
  { label: "In Prog", value: 300, className: "bg-amber-500" },
  { label: "Resolved", value: 274, className: "bg-blue-500" },
];
const totalActiveBugs = bugBreakdown.reduce((sum, { value }) => sum + value, 0);

const priorityBreakdown = [
  { label: "P0 - Blocker", pct: 15 },
  { label: "P1 - Critical", pct: 30 },
  { label: "P2 - Major", pct: 35 },
  { label: "P3 - Minor", pct: 20 },
];

const resolutionTrend = [30, 42, 38, 50, 46, 58, 62, 55, 68, 75, 80, 92];

const priorityStyles: Record<string, string> = {
  "P0 - Blocker": "bg-red-100 text-red-700",
  "P1 - Critical": "bg-red-600 text-white",
  "P2 - Major": "bg-blue-100 text-blue-700",
  "P3 - Minor": "bg-rose-50 text-rose-400",
};

const statusStyles: Record<string, string> = {
  Open: "bg-red-50 text-red-600",
  "In Progress": "bg-blue-50 text-blue-600",
  Resolved: "bg-blue-100 text-blue-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

const recentBugs = [
  {
    id: "BUG-4092",
    title: "Auth token expires prematurely on mobile",
    project: "Mobile App v2",
    priority: "P0 - Blocker",
    status: "Open",
    source: "Manual",
  },
  {
    id: "BUG-4091",
    title: "Payment gateway timeout in EU region",
    project: "Core Services",
    priority: "P1 - Critical",
    status: "In Progress",
    source: "Automation",
  },
  {
    id: "BUG-4088",
    title: "Dashboard stats not updating after filter",
    project: "Web Portal",
    priority: "P2 - Major",
    status: "Open",
    source: "Manual",
  },
  {
    id: "BUG-4085",
    title: "Typo in onboarding tooltip step 3",
    project: "Web Portal",
    priority: "P3 - Minor",
    status: "Resolved",
    source: "Manual",
  },
  {
    id: "BUG-4081",
    title: "Database connection pool exhaustion on load",
    project: "Core Services",
    priority: "P0 - Blocker",
    status: "Closed",
    source: "Automation",
  },
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-border bg-card min-w-0 rounded-lg border p-5 ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          High-level metrics and recent activity across all projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {overviewStats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className="mt-1 text-3xl font-semibold">{value}</p>
            </div>
            <Icon className="text-muted-foreground size-5" />
          </Card>
        ))}

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Total Active Bugs</p>
            <Bug className="text-muted-foreground size-5" />
          </div>
          <p className="mt-1 text-3xl font-semibold">{totalActiveBugs.toLocaleString()}</p>
          <div className="border-border mt-3 flex h-2 overflow-hidden rounded-full border">
            {bugBreakdown.map(({ label, value, className }) => (
              <div
                key={label}
                className={className}
                style={{ width: `${(value / totalActiveBugs) * 100}%` }}
              />
            ))}
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {bugBreakdown.map(({ label, value, className }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${className}`} />
                {label} ({value})
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Bugs by Priority
          </p>
          <div className="mt-4 space-y-3">
            {priorityBreakdown.map(({ label, pct }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-foreground font-medium">{label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="bg-accent h-2 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Resolution Trend (30 Days)
          </p>
          <div className="mt-4 flex h-32 items-end gap-1.5">
            {resolutionTrend.map((value, i) => (
              <div
                key={i}
                className="bg-primary flex-1 rounded-t-sm"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
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
                  <td className="text-muted-foreground px-5 py-3 font-mono text-xs">{bug.id}</td>
                  <td className="px-5 py-3 font-medium">{bug.title}</td>
                  <td className="text-muted-foreground px-5 py-3">{bug.project}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="outline"
                      className={`border-transparent ${priorityStyles[bug.priority]}`}
                    >
                      {bug.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="outline"
                      className={`border-transparent ${statusStyles[bug.status]}`}
                    >
                      {bug.status}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-5 py-3">{bug.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-5" />
      </Card>
    </div>
  );
}
