import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">ICore Bug Tracker</h1>
      <p className="text-muted-foreground max-w-md">
        Project foundation is set up. UI, auth, and bug management land in the phases ahead.
      </p>
      <Button>Get started</Button>
    </div>
  );
}
