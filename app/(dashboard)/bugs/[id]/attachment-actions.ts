"use server";

import { revalidatePath } from "next/cache";

import { deleteAttachment } from "@/services/bugs";

export async function deleteAttachmentAction(attachmentId: string, bugId: string) {
  const { error } = await deleteAttachment(attachmentId);
  if (!error) revalidatePath(`/bugs/${bugId}`);
  return { error };
}
