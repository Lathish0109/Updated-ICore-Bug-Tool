"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="text-destructive size-6" />
      </div>
      <div>
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          An unexpected error occurred while loading this page. Try again, and let us know if it
          keeps happening.
        </p>
      </div>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
