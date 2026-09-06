import { notFound, redirect } from "next/navigation";

import { EditProjectForm } from "@/components/shared/edit-project-form";
import { getCurrentProfile } from "@/services/profile";
import { getMembershipCandidates, getProject } from "@/services/projects";

import { updateProjectAction } from "./actions";

export default async function EditProjectPage({ params }: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;
  const [project, profile, candidates] = await Promise.all([
    getProject(id),
    getCurrentProfile(),
    getMembershipCandidates(),
  ]);

  if (!project) notFound();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && profile.role !== "manager") redirect(`/projects/${id}`);

  const boundAction = updateProjectAction.bind(null, id);

  return (
    <EditProjectForm
      projectId={id}
      candidates={candidates}
      action={boundAction}
      defaultValues={{
        name: project.name,
        key: project.key,
        description: project.description ?? "",
        status: project.status,
        memberIds: project.members.map((m) => m.id),
      }}
    />
  );
}
