import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayId, getRecentBugsForProject, STATUS_LABELS } from "@/services/bugs";
import { getCurrentProfile } from "@/services/profile";
import { getProject } from "@/services/projects";

const statusStyles: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  in_progress: "bg-blue-50 text-blue-600",
  resolved: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
};

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const [project, profile] = await Promise.all([getProject(id), getCurrentProfile()]);
  if (!project) notFound();

  const bugs = await getRecentBugsForProject(id);
  const canEdit = profile?.role === "admin" || profile?.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-md text-sm font-semibold ${project.colorClassName}`}
          >
            {project.initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground text-sm">
              {project.description || "No description yet."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button variant="outline" render={<Link href={`/projects/${project.id}/edit`} />}>
              <Pencil /> Edit
            </Button>
          ) : null}
          <Button render={<Link href="/bugs/new" />}>
            <Plus /> New Bug
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Open Bugs</p>
          <p className="text-primary mt-1 text-2xl font-semibold">{project.openBugs}</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Resolved (7d)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{project.resolved7d}</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Members</p>
          <p className="mt-1 text-2xl font-semibold">{project.members.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border-border bg-card rounded-lg border lg:col-span-2">
          <p className="text-muted-foreground border-border border-b px-5 py-3 text-xs font-medium tracking-wide uppercase">
            Recent Bugs
          </p>
          {bugs.length === 0 ? (
            <p className="text-muted-foreground px-5 py-6 text-sm">No bugs reported yet.</p>
          ) : (
            <ul className="divide-border divide-y">
              {bugs.map((bug) => (
                <li key={bug.id} className="flex items-center justify-between px-5 py-3">
                  <Link href={`/bugs/${bug.id}`} className="min-w-0">
                    <p className="text-muted-foreground font-mono text-xs">
                      {displayId(project.key, bug.sequence_number)}
                    </p>
                    <p className="truncate text-sm font-medium">{bug.title}</p>
                  </Link>
                  <Badge
                    variant="outline"
                    className={`border-transparent ${statusStyles[bug.status]}`}
                  >
                    {STATUS_LABELS[bug.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Members
          </p>
          {project.members.length === 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">No members assigned yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {project.members.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
