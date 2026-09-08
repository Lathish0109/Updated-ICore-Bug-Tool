import { createClient } from "@/lib/supabase/server";
import {
  displayId,
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  type Bug,
} from "@/lib/bug-constants";

export type BugExportFilters = {
  projectId?: string;
  status?: string;
  from?: string;
  to?: string;
};

const EXPORT_SELECT =
  "id, title, status, priority, severity, source, sequence_number, created_at, updated_at, project:projects(name, key), assignee:profiles!bugs_assignee_id_fkey(full_name), reporter:profiles!bugs_reporter_id_fkey(full_name)";

type ExportRow = {
  id: string;
  title: string;
  status: Bug["status"];
  priority: Bug["priority"];
  severity: Bug["severity"];
  source: Bug["source"];
  sequence_number: number;
  created_at: string;
  updated_at: string;
  project: { name: string; key: string } | null;
  assignee: { full_name: string } | null;
  reporter: { full_name: string } | null;
};

const HEADER = [
  "Bug ID",
  "Title",
  "Project",
  "Status",
  "Priority",
  "Severity",
  "Source",
  "Assignee",
  "Reporter",
  "Created At",
  "Updated At",
];

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportBugsCsv(filters: BugExportFilters): Promise<string> {
  const supabase = await createClient();
  let query = supabase.from("bugs").select(EXPORT_SELECT).order("created_at", { ascending: false });

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.status) query = query.eq("status", filters.status as Bug["status"]);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);

  const { data } = await query;
  const rows = (data ?? []) as unknown as ExportRow[];

  const lines = [HEADER.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(
      [
        displayId(row.project?.key ?? "???", row.sequence_number),
        row.title,
        row.project?.name ?? "Unknown project",
        STATUS_LABELS[row.status],
        PRIORITY_LABELS[row.priority],
        SEVERITY_LABELS[row.severity],
        SOURCE_LABELS[row.source],
        row.assignee?.full_name ?? "Unassigned",
        row.reporter?.full_name ?? "Unknown",
        row.created_at,
        row.updated_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  return lines.join("\r\n");
}
