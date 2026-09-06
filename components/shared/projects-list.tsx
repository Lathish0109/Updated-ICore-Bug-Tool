"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProjectWithStats } from "@/services/projects";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

type Tab = "All" | "Active" | "Archived";

export function ProjectsList({ projects }: { projects: ProjectWithStats[] }) {
  const [tab, setTab] = useState<Tab>("All");

  const tabs: { label: Tab; count: number }[] = useMemo(
    () => [
      { label: "All", count: projects.length },
      { label: "Active", count: projects.filter((p) => p.status === "active").length },
      { label: "Archived", count: projects.filter((p) => p.status === "archived").length },
    ],
    [projects],
  );

  const filteredProjects = projects.filter((p) => tab === "All" || p.status === tab.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="border-border flex gap-6 border-b text-sm">
        {tabs.map(({ label, count }) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={
              tab === label
                ? "text-primary border-primary -mb-px border-b-2 pb-2 font-medium"
                : "text-muted-foreground hover:text-foreground pb-2"
            }
          >
            {label === "All" ? "All Projects" : label} ({count})
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? "No projects yet" : `No ${tab.toLowerCase()} projects`}
          description={
            tab === "Archived"
              ? "Projects you archive will show up here."
              : "Create a project to get started."
          }
          action={
            tab !== "Archived" && (
              <Button size="sm" render={<Link href="/projects/new" />}>
                <Plus /> Create Project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="border-border bg-card hover:border-primary/40 flex flex-col rounded-lg border p-5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex size-9 items-center justify-center rounded-md text-xs font-semibold ${project.colorClassName}`}
                >
                  {project.initials}
                </div>
                <Badge
                  variant="outline"
                  className={`border-transparent ${statusStyles[project.status]}`}
                >
                  {project.status === "active" ? "Active" : "Archived"}
                </Badge>
              </div>

              <h2 className="mt-3 font-semibold">{project.name}</h2>
              <span className="text-muted-foreground w-fit font-mono text-[0.65rem]">
                {project.key}
              </span>
              <p className="text-muted-foreground mt-2 flex-1 text-sm">
                {project.description || "No description yet."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Open Bugs</p>
                  <p className="text-primary text-lg font-semibold">{project.openBugs}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Resolved (7d)</p>
                  <p className="text-lg font-semibold text-emerald-600">{project.resolved7d}</p>
                </div>
              </div>

              {project.members.length > 0 ? (
                <div className="border-border mt-4 flex items-center gap-2 border-t pt-3">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[0.65rem]">
                      {project.members[0].name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground text-xs">{project.members[0].name}</span>
                  {project.members.length > 1 ? (
                    <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                      +{project.members.length - 1}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
