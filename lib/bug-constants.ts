import type { Enums, Tables } from "@/types/database";

export type Bug = Tables<"bugs">;
export type BugLabel = Enums<"bug_label">;

export type BugWithRelations = Bug & {
  projectName: string;
  projectKey: string;
  assigneeName: string | null;
  reporterName: string;
  labels: string[];
};

export const STATUS_LABELS: Record<Bug["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<Bug["priority"], string> = {
  p1: "P1 - Critical",
  p2: "P2 - High",
  p3: "P3 - Medium",
  p4: "P4 - Low",
};

export const SEVERITY_LABELS: Record<Bug["severity"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const SOURCE_LABELS: Record<Bug["source"], string> = {
  manual: "Manual QA",
  automation: "Automation",
  user_reported: "User Reported",
};

export function displayId(projectKey: string, sequenceNumber: number) {
  return `${projectKey}-${sequenceNumber}`;
}
