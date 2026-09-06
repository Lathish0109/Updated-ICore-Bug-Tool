import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectsList } from "@/components/shared/projects-list";
import { getProjects } from "@/services/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

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

      <ProjectsList projects={projects} />
    </div>
  );
}
