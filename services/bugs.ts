import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Bug = Tables<"bugs">;

export const STATUS_LABELS: Record<Bug["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function displayId(projectKey: string, sequenceNumber: number) {
  return `${projectKey}-${sequenceNumber}`;
}

export async function getRecentBugsForProject(projectId: string, limit = 5) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bugs")
    .select("id, sequence_number, title, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
