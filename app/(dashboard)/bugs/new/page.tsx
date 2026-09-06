import { NewBugForm } from "@/components/shared/new-bug-form";
import { getAllProjectsBasic } from "@/services/projects";
import { getAssignableUsers } from "@/services/users";

export default async function NewBugPage() {
  const [projects, assignees] = await Promise.all([getAllProjectsBasic(), getAssignableUsers()]);

  return <NewBugForm projects={projects} assignees={assignees} />;
}
