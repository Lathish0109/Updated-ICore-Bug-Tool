import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectsList } from "@/components/shared/projects-list";
import { getProjects } from "@/services/projects";

const PAGE_SIZE = 12;

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { projects, totalCount } = await getProjects({ page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and monitor active QA initiatives.
          </p>
        </div>
        <Button render={<Link href="/projects/new" />}>
          <Plus /> Create Project
        </Button>
      </div>

      <ProjectsList projects={projects} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
