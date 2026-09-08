import { BugsList } from "@/components/shared/bugs-list";
import { getBugs } from "@/services/bugs";

const PAGE_SIZE = 20;

export default async function BugsPage({ searchParams }: PageProps<"/bugs">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { bugs, totalCount } = await getBugs({ page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bug Triage</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and track active software defects across all projects.
        </p>
      </div>

      <BugsList bugs={bugs} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
