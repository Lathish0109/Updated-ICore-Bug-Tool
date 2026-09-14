"use server";

import { revalidatePath } from "next/cache";

import { createApiKey, revokeApiKey } from "@/services/api-keys";

export async function createApiKeyAction(input: { name: string; projectId: string }) {
  const result = await createApiKey(input);
  if (!result.error) revalidatePath("/settings/api-keys");
  return result;
}

export async function revokeApiKeyAction(id: string) {
  const result = await revokeApiKey(id);
  if (!result.error) revalidatePath("/settings/api-keys");
  return result;
}
