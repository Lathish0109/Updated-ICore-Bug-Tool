"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProject } from "@/services/projects";

export async function createProjectAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const key = (formData.get("key") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !key) {
    return { error: "Name and key are required." };
  }

  const { error } = await createProject({ name, key, description });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? `Project key "${key}" is already in use.`
          : "Couldn't create project.",
    };
  }

  revalidatePath("/projects");
  redirect("/projects");
}
