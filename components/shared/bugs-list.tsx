import Link from "next/link";
import { Bug as BugIcon } from "lucide-react";

import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  displayId,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  type BugWithRelations,
} from "@/lib/bug-constants";

const priorityStyles: Record<string, string> = {
  p1: "bg-[#ff6f61] text-white",
  p2: "bg-[#ff6f61]/15 text-[#ff6f61]",
  p3: "bg-violet-500/15 text-violet-300",
  p4: "bg-slate-500/15 text-slate-400",
};

const statusDotStyles: Record<string, string> = {
  open: "bg-[#ff6f61]",
  in_progress: "bg-amber-500",
  resolved: "bg-cyan-400",
  closed: "bg-slate-500",
};

export function BugsList({
  bugs,
  page,
  pageSize,
  totalCount,
  extraParams,
}: {
  bugs: BugWithRelations[];
  page: number;
  pageSize: number;
  totalCount: number;
  extraParams?: Record<string, string>;
}) {
  const hasActiveFilters = Object.keys(extraParams ?? {}).length > 0;

  return (
    <div className="border-border bg-card overflow-x-auto rounded-lg border">
      {bugs.length === 0 ? (
        <EmptyState
          icon={BugIcon}
          title={hasActiveFilters ? "No bugs match your filters" : "No bugs reported yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Create a bug to start tracking issues."
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
              {bugs.map((bug) => (
                <tr key={bug.id} className="border-border hover:bg-muted/50 border-b last:border-0">
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
                  <td className="px-5 py-3">
                    {bug.source === "automation" ? (
                      <Badge variant="outline" className="border-transparent bg-indigo-500/15 text-indigo-300">
                        {SOURCE_LABELS[bug.source]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">{SOURCE_LABELS[bug.source]}</span>
                    )}
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
                    {formatDate(bug.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            basePath="/bugs"
            extraParams={extraParams}
          />
        </>
      )}
    </div>
  );
}
