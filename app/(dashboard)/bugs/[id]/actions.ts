"use server";

import { revalidatePath } from "next/cache";

import { addComment, updateBugStatus } from "@/services/bugs";
import type { Tables } from "@/types/database";

export async function addCommentAction(bugId: string, body: string) {
  const { error } = await addComment(bugId, body);
  if (!error) revalidatePath(`/bugs/${bugId}`);
  return { error };
}

export async function updateStatusAction(bugId: string, status: Tables<"bugs">["status"]) {
  const { error } = await updateBugStatus(bugId, status);
  if (!error) revalidatePath(`/bugs/${bugId}`);
  return { error };
}
