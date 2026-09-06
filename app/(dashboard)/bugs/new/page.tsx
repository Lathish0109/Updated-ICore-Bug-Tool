import { NewBugForm } from "@/components/shared/new-bug-form";
import { getAllProjectsBasic } from "@/services/projects";
import { getAssignableUsers } from "@/services/users";

import { createBugFormAction } from "./actions";

export default async function NewBugPage() {
  const [projects, assignees] = await Promise.all([getAllProjectsBasic(), getAssignableUsers()]);

  return (
    <NewBugForm
      mode="create"
      projects={projects}
      assignees={assignees}
      action={createBugFormAction}
    />
  );
}
