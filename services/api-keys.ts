import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";

export type ApiKeyWithProject = {
  id: string;
  name: string;
  keyPrefix: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export async function getApiKeys(): Promise<ApiKeyWithProject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("api_keys")
    .select("*, project:projects(name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    projectId: row.project_id,
    projectName: (row.project as { name: string } | null)?.name ?? "Unknown project",
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  }));
}

/** Creates a key and returns the full secret -- the only time it's ever
 * readable. Every later read (getApiKeys) only ever sees the stored hash
 * and display prefix. */
export async function createApiKey(input: { name: string; projectId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", key: null };

  const { key, hash, prefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    name: input.name,
    project_id: input.projectId,
    key_hash: hash,
    key_prefix: prefix,
    created_by: user.id,
  });
  if (error) return { error: "Couldn't create the key.", key: null };

  return { error: null, key };
}

export async function revokeApiKey(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error ? "Couldn't revoke the key." : null };
}
