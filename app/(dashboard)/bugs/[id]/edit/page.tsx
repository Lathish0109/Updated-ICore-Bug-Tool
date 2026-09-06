import { notFound, redirect } from "next/navigation";

import { NewBugForm } from "@/components/shared/new-bug-form";
import type { BugLabel } from "@/lib/bug-constants";
import { getBug } from "@/services/bugs";
import { getCurrentProfile } from "@/services/profile";
import { getAllProjectsBasic } from "@/services/projects";
import { getAssignableUsers } from "@/services/users";

import { updateBugFormAction } from "./actions";

export default async function EditBugPage({ params }: PageProps<"/bugs/[id]/edit">) {
  const { id } = await params;
  const [bug, profile, projects, assignees] = await Promise.all([
    getBug(id),
    getCurrentProfile(),
    getAllProjectsBasic(),
    getAssignableUsers(),
  ]);

  if (!bug) notFound();
  if (!profile) redirect("/login");

  const canEdit =
    profile.role === "admin" ||
    profile.role === "manager" ||
    ((profile.role === "developer" || profile.role === "tester") &&
      (bug.assignee_id === profile.id || bug.reporter_id === profile.id));

  if (!canEdit) redirect(`/bugs/${id}`);

  const boundAction = updateBugFormAction.bind(null, id);

  return (
    <NewBugForm
      mode="edit"
      projects={projects}
      assignees={assignees}
      backHref={`/bugs/${id}`}
      action={boundAction}
      defaultValues={{
        title: bug.title,
        projectId: bug.project_id,
        projectName: bug.projectName,
        source: bug.source,
        severity: bug.severity,
        priority: bug.priority,
        assigneeId: bug.assignee_id ?? "unassigned",
        labels: bug.labels as BugLabel[],
        steps: bug.steps_to_reproduce,
        expected: bug.expected_result ?? "",
        actual: bug.actual_result ?? "",
        context: bug.additional_context ?? "",
      }}
    />
  );
}
