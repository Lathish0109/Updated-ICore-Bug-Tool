import { createClient } from "@/lib/supabase/server";
import { displayId } from "@/lib/bug-constants";

const RESULTS_PER_CATEGORY = 5;

export async function globalSearch(query: string) {
  const q = query.trim();
  if (q.length < 2) {
    return { bugs: [], projects: [], users: [] };
  }

  const supabase = await createClient();
  const escaped = q.replace(/[%_]/g, "\\$&");

  const [{ data: bugs }, { data: projects }, { data: users }] = await Promise.all([
    supabase
      .from("bugs")
      .select("id, title, sequence_number, project:projects(key)")
      .ilike("title", `%${escaped}%`)
      .limit(RESULTS_PER_CATEGORY),
    supabase
      .from("projects")
      .select("id, name, key")
      .or(`name.ilike.%${escaped}%,key.ilike.%${escaped}%`)
      .limit(RESULTS_PER_CATEGORY),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`)
      .limit(RESULTS_PER_CATEGORY),
  ]);

  return {
    bugs: (bugs ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      displayId: displayId((b.project as { key: string } | null)?.key ?? "???", b.sequence_number),
    })),
    projects: (projects ?? []).map((p) => ({ id: p.id, name: p.name, key: p.key })),
    users: (users ?? []).map((u) => ({ id: u.id, name: u.full_name, email: u.email })),
  };
}
