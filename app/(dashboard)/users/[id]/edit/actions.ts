"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateUserAccount } from "@/services/users";
import type { Tables } from "@/types/database";

export async function updateUserFormAction(
  userId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Tables<"profiles">["role"];
  const status = formData.get("status") ? "active" : "inactive";
  const projectValues = formData.getAll("projects") as string[];
  const projectIds = projectValues.includes("all")
    ? ("all" as const)
    : projectValues.filter((v) => v !== "all");

  if (!name) {
    return { error: "Name is required." };
  }
  if (password && password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { error } = await updateUserAccount({
    id: userId,
    name,
    password: password || undefined,
    role,
    status,
    projectIds,
  });
  if (error) return { error };

  revalidatePath("/users");
  redirect("/users");
}
