"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bug as BugIcon, Search } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  displayId,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type BugWithRelations,
} from "@/lib/bug-constants";

const priorityStyles: Record<string, string> = {
  p1: "bg-red-600 text-white",
  p2: "bg-red-100 text-red-700",
  p3: "bg-blue-100 text-blue-700",
  p4: "bg-slate-100 text-slate-600",
};

const statusDotStyles: Record<string, string> = {
  open: "bg-red-500",
  in_progress: "bg-amber-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-400",
};

export function BugsList({ bugs }: { bugs: BugWithRelations[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BugWithRelations["status"] | "all">("all");

  const filteredBugs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bugs.filter((bug) => {
      if (statusFilter !== "all" && bug.status !== statusFilter) return false;
      const id = displayId(bug.projectKey, bug.sequence_number).toLowerCase();
      if (query && !id.includes(query) && !bug.title.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [bugs, search, statusFilter]);

  const hasActiveFilters = search !== "" || statusFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by bug ID or title..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border">
        {filteredBugs.length === 0 ? (
          <EmptyState
            icon={BugIcon}
            title={bugs.length === 0 ? "No bugs reported yet" : "No bugs match your filters"}
            description={
              bugs.length === 0
                ? "Create a bug to start tracking issues."
                : "Try adjusting your search or clearing the active filters."
            }
            action={
              hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear search and filters
                </Button>
              )
            }
          />
        ) : (
          <>
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
                {filteredBugs.map((bug) => (
                  <tr
                    key={bug.id}
                    className="border-border hover:bg-muted/50 border-b last:border-0"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/bugs/${bug.id}`}
                        className="text-muted-foreground font-mono text-xs hover:underline"
                      >
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
                      <span
                        className={`inline-flex items-center gap-1.5 ${bug.status === "closed" ? "text-muted-foreground line-through" : ""}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusDotStyles[bug.status]}`} />
                        {STATUS_LABELS[bug.status]}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-5 py-3 capitalize">
                      {bug.source.replace("_", " ")}
                    </td>
                    <td className="px-5 py-3">
                      {bug.assigneeName ? (
                        <span className="flex items-center gap-1.5">
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[0.6rem]">
                              {bug.assigneeName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{bug.assigneeName}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-5 py-3 text-xs">
                      {formatRelativeTime(bug.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-sm">
              <span>
                Showing {filteredBugs.length} of {bugs.length} bugs
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
