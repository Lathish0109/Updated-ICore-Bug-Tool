import { BugsFilterBar } from "@/components/shared/bugs-filter-bar";
import { BugsList } from "@/components/shared/bugs-list";
import { ExportBugsButton } from "@/components/shared/export-bugs-button";
import { getBugs, type Bug } from "@/services/bugs";
import { getAllProjectsBasic } from "@/services/projects";

const PAGE_SIZE = 20;

function startOfDayIso(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function endOfDayIso(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export default async function BugsPage({ searchParams }: PageProps<"/bugs">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? (params.status as Bug["status"]) : undefined;
  const project = typeof params.project === "string" ? params.project : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const [{ bugs, totalCount }, projects] = await Promise.all([
    getBugs({
      page,
      pageSize: PAGE_SIZE,
      search: q,
      status,
      projectId: project,
      createdFrom: from ? startOfDayIso(from) : undefined,
      createdTo: to ? endOfDayIso(to) : undefined,
    }),
    getAllProjectsBasic(),
  ]);

  const extraParams: Record<string, string> = {};
  if (q) extraParams.q = q;
  if (status) extraParams.status = status;
  if (project) extraParams.project = project;
  if (from) extraParams.from = from;
  if (to) extraParams.to = to;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bug Triage</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and track active software defects across all projects.
          </p>
        </div>
        <ExportBugsButton projectId={project} status={status} from={from} to={to} />
      </div>

      <BugsFilterBar projects={projects} />

      <BugsList
        bugs={bugs}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        extraParams={extraParams}
      />
    </div>
  );
}
