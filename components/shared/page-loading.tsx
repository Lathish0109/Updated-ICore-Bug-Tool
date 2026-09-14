import { Bug } from "lucide-react";

export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3">
      <Bug className="text-primary size-8 animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}
