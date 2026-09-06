import Link from "next/link";
import { Bug } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-accent flex size-14 items-center justify-center rounded-full">
        <Bug className="text-primary size-7" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>Back to Dashboard</Button>
    </div>
  );
}
