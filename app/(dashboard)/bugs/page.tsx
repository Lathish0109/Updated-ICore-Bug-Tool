import Link from "next/link";
import { Download, SlidersHorizontal, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-blue-100 text-blue-700",
  Low: "bg-slate-100 text-slate-600",
};

const statusDotStyles: Record<string, string> = {
  Open: "bg-red-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-emerald-500",
  Closed: "bg-slate-400",
};

const bugs = [
  {
    id: "IC-4921",
    title: "Payment gateway timeout on checkout finalization",
    project: "E-Commerce Core",
    priority: "Critical",
    status: "Open",
    source: "Automation",
    assignee: "J. Smith",
    created: "2h ago",
  },
  {
    id: "IC-4918",
    title: "Null pointer exception in user profile image upload",
    project: "User Mgmt",
    priority: "High",
    status: "In Progress",
    source: "Manual",
    assignee: "A. Lee",
    created: "4h ago",
  },
  {
    id: "IC-4905",
    title: "Dashboard layout breaks on 1024px viewport",
    project: "Admin Panel",
    priority: "Medium",
    status: "Resolved",
    source: "Manual",
    assignee: "M. Khan",
    created: "Yesterday",
  },
  {
    id: "IC-4899",
    title: "Typo in onboarding tooltip step 3",
    project: "Onboarding",
    priority: "Low",
    status: "Closed",
    source: "Manual",
    assignee: null,
    created: "Oct 24",
  },
];

const activeFilters = ["Status: Open, In Progress", "Priority: Critical, High"];

export default function BugsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bug Triage</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and track active software defects across all projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <SlidersHorizontal /> Filters
          </Button>
          <Button variant="outline">
            <Download /> Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <Badge key={filter} variant="outline" className="gap-1.5 py-1 pr-1.5 pl-2.5">
            {filter}
            <X className="size-3 cursor-pointer" />
          </Badge>
        ))}
        <button type="button" className="text-primary text-sm font-medium hover:underline">
          Clear All
        </button>
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-border border-b text-left text-xs">
              <th className="px-5 py-3 font-medium">Bug ID</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Assigned To</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => (
              <tr key={bug.id} className="border-border hover:bg-muted/50 border-b last:border-0">
                <td className="px-5 py-3">
                  <Link
                    href={`/bugs/${bug.id}`}
                    className="text-muted-foreground font-mono text-xs hover:underline"
                  >
                    {bug.id}
                  </Link>
                </td>
                <td className="px-5 py-3 font-medium">
                  <Link href={`/bugs/${bug.id}`} className="hover:underline">
                    {bug.title}
                  </Link>
                </td>
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
                  <span
                    className={`inline-flex items-center gap-1.5 ${bug.status === "Closed" ? "text-muted-foreground line-through" : ""}`}
                  >
                    <span className={`size-1.5 rounded-full ${statusDotStyles[bug.status]}`} />
                    {bug.status}
                  </span>
                </td>
                <td className="text-muted-foreground px-5 py-3">{bug.source}</td>
                <td className="px-5 py-3">
                  {bug.assignee ? (
                    <span className="flex items-center gap-1.5">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[0.6rem]">{bug.assignee[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{bug.assignee}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Unassigned</span>
                  )}
                </td>
                <td className="text-muted-foreground px-5 py-3 text-xs">{bug.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-sm">
          <span>Showing 1 to 4 of 128 bugs</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled>
              &lt;
            </Button>
            <Button variant="outline" size="icon-sm">
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
