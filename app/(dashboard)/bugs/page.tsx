import { BugsList } from "@/components/shared/bugs-list";
import { getBugs } from "@/services/bugs";

export default async function BugsPage() {
  const bugs = await getBugs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bug Triage</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and track active software defects across all projects.
        </p>
      </div>

      <BugsList bugs={bugs} />
    </div>
  );
}
