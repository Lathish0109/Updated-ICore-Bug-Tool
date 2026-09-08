import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navButtonClass = cn(
  "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] border px-2.5 text-[0.8rem] font-medium transition-all [&_svg:not([class*='size-'])]:size-3.5",
);

export function PaginationControls({
  page,
  pageSize,
  totalCount,
  basePath,
  extraParams,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  basePath: string;
  /** Other active query params (filters/search) to preserve when paging. */
  extraParams?: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(extraParams);
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-sm">
      <span>
        Page {page} of {totalPages} &middot; {totalCount} total
      </span>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <span className={cn(navButtonClass, "border-border pointer-events-none opacity-50")}>
            <ChevronLeft /> Previous
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={hrefFor(page - 1)} scroll={false} />}
          >
            <ChevronLeft /> Previous
          </Button>
        )}
        {page >= totalPages ? (
          <span className={cn(navButtonClass, "border-border pointer-events-none opacity-50")}>
            Next <ChevronRight />
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={hrefFor(page + 1)} scroll={false} />}
          >
            Next <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}
