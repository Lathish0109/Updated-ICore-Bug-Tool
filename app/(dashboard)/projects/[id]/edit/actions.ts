"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setProjectMembers, updateProject } from "@/services/projects";

export async function updateProjectAction(
  projectId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const key = (formData.get("key") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") ? "active" : "archived";
  const memberIds = formData.getAll("members") as string[];

  if (!name || !key) {
    return { error: "Name and key are required." };
  }

  const { error } = await updateProject(projectId, { name, key, description, status });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? `Project key "${key}" is already in use.`
          : "Couldn't update project.",
    };
  }

  await setProjectMembers(projectId, memberIds);

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
