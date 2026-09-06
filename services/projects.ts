import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Project = Tables<"projects">;

export type ProjectWithStats = Project & {
  initials: string;
  colorClassName: string;
  openBugs: number;
  resolved7d: number;
  members: { id: string; name: string }[];
};

const PROJECT_COLORS = [
  "bg-blue-600 text-white",
  "bg-primary text-primary-foreground",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-amber-500 text-white",
  "bg-rose-100 text-rose-500",
];

function colorFor(key: string) {
  const hash = [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
}

export async function getProjects(): Promise<ProjectWithStats[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !projects) return [];

  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return [];

  const [{ data: bugs }, { data: members }] = await Promise.all([
    supabase.from("bugs").select("project_id, status, updated_at").in("project_id", projectIds),
    supabase
      .from("project_members")
      .select("project_id, user_id, profiles(full_name)")
      .in("project_id", projectIds),
  ]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return projects.map((project) => {
    const projectBugs = bugs?.filter((b) => b.project_id === project.id) ?? [];
    const openBugs = projectBugs.filter(
      (b) => b.status === "open" || b.status === "in_progress",
    ).length;
    const resolved7d = projectBugs.filter(
      (b) => b.status === "resolved" && new Date(b.updated_at).getTime() >= sevenDaysAgo,
    ).length;
    const projectMembers = (members ?? [])
      .filter((m) => m.project_id === project.id)
      .map((m) => ({
        id: m.user_id,
        name: (m.profiles as unknown as { full_name: string } | null)?.full_name ?? "Unknown",
      }));

    return {
      ...project,
      initials: project.key.slice(0, 3).toUpperCase(),
      colorClassName: colorFor(project.key),
      openBugs,
      resolved7d,
      members: projectMembers,
    };
  });
}

export async function getProject(id: string): Promise<ProjectWithStats | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !project) return null;

  const [{ data: bugs }, { data: members }] = await Promise.all([
    supabase.from("bugs").select("status, updated_at").eq("project_id", id),
    supabase.from("project_members").select("user_id, profiles(full_name)").eq("project_id", id),
  ]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const openBugs = (bugs ?? []).filter(
    (b) => b.status === "open" || b.status === "in_progress",
  ).length;
  const resolved7d = (bugs ?? []).filter(
    (b) => b.status === "resolved" && new Date(b.updated_at).getTime() >= sevenDaysAgo,
  ).length;

  return {
    ...project,
    initials: project.key.slice(0, 3).toUpperCase(),
    colorClassName: colorFor(project.key),
    openBugs,
    resolved7d,
    members: (members ?? []).map((m) => ({
      id: m.user_id,
      name: (m.profiles as unknown as { full_name: string } | null)?.full_name ?? "Unknown",
    })),
  };
}

export async function getAllProjectsBasic() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, name").order("name");
  return data ?? [];
}

export async function createProject(
  input: Pick<TablesInsert<"projects">, "name" | "key" | "description">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return supabase
    .from("projects")
    .insert({ ...input, key: input.key.toUpperCase(), created_by: user?.id })
    .select()
    .single();
}

/** Active, non-privileged users who can be assigned as project members.
 * Admins and managers already see every project via RLS, so they're
 * excluded here -- membership rows are only meaningful for the other roles. */
export async function getMembershipCandidates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("status", "active")
    .order("full_name");
  return (data ?? []).filter((p) => p.role !== "admin" && p.role !== "manager");
}

export async function updateProject(
  id: string,
  input: Pick<TablesUpdate<"projects">, "name" | "key" | "description" | "status">,
) {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .update({ ...input, key: input.key ? input.key.toUpperCase() : undefined })
    .eq("id", id)
    .select()
    .single();
}

export async function setProjectMembers(projectId: string, userIds: string[]) {
  const supabase = await createClient();
  await supabase.from("project_members").delete().eq("project_id", projectId);
  if (userIds.length > 0) {
    await supabase
      .from("project_members")
      .insert(userIds.map((user_id) => ({ project_id: projectId, user_id })));
  }
}
