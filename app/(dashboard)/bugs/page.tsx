import { BugsList } from "@/components/shared/bugs-list";
import { ExportBugsButton } from "@/components/shared/export-bugs-button";
import { getBugs } from "@/services/bugs";
import { getAllProjectsBasic } from "@/services/projects";

const PAGE_SIZE = 20;

export default async function BugsPage({ searchParams }: PageProps<"/bugs">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [{ bugs, totalCount }, projects] = await Promise.all([
    getBugs({ page, pageSize: PAGE_SIZE }),
    getAllProjectsBasic(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bug Triage</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and track active software defects across all projects.
          </p>
        </div>
        <ExportBugsButton projects={projects} />
      </div>

      <BugsList bugs={bugs} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
