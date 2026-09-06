import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import { STATUS_LABELS, type Bug, type BugLabel, type BugWithRelations } from "@/lib/bug-constants";
import { notify } from "@/services/notifications";

export type { Bug, BugLabel, BugWithRelations };
export {
  STATUS_LABELS,
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  SOURCE_LABELS,
  displayId,
} from "@/lib/bug-constants";

type ProfileRef = { full_name: string } | null;

const BUG_SELECT =
  "*, project:projects(name, key), assignee:profiles!bugs_assignee_id_fkey(full_name), reporter:profiles!bugs_reporter_id_fkey(full_name), bug_labels(label)";

type RawBugRow = Bug & {
  project: { name: string; key: string } | null;
  assignee: ProfileRef;
  reporter: ProfileRef;
  bug_labels: { label: string }[];
};

function mapBugRow(row: RawBugRow): BugWithRelations {
  const { project, assignee, reporter, bug_labels, ...bug } = row;
  return {
    ...bug,
    projectName: project?.name ?? "Unknown project",
    projectKey: project?.key ?? "???",
    assigneeName: assignee?.full_name ?? null,
    reporterName: reporter?.full_name ?? "Unknown",
    labels: bug_labels.map((l) => l.label),
  };
}

export async function getBugs(): Promise<BugWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bugs")
    .select(BUG_SELECT)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as RawBugRow[]).map(mapBugRow);
}

export async function getBug(id: string): Promise<BugWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bugs").select(BUG_SELECT).eq("id", id).single();
  if (error || !data) return null;
  return mapBugRow(data as unknown as RawBugRow);
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

export async function getBugComments(bugId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bug_comments")
    .select("*, author:profiles(full_name)")
    .eq("bug_id", bugId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    authorName: (c.author as ProfileRef)?.full_name ?? "Unknown",
  }));
}

export async function getBugActivity(bugId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bug_activity")
    .select("*, actor:profiles(full_name)")
    .eq("bug_id", bugId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    detail: a.detail,
    createdAt: a.created_at,
    actorName: (a.actor as ProfileRef)?.full_name ?? "System",
  }));
}

export async function getBugAttachments(bugId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bug_attachments")
    .select("*")
    .eq("bug_id", bugId)
    .order("created_at", { ascending: false });
  if (!data) return [];

  return data.map((a) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("bug-attachments").getPublicUrl(a.file_path);
    return { ...a, url: publicUrl };
  });
}

type CreateBugInput = Pick<
  TablesInsert<"bugs">,
  | "project_id"
  | "title"
  | "steps_to_reproduce"
  | "expected_result"
  | "actual_result"
  | "additional_context"
  | "severity"
  | "priority"
  | "source"
  | "assignee_id"
> & { labels: BugLabel[] };

export async function createBug(input: CreateBugInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", bugId: null };

  const { labels, ...bugFields } = input;

  const { data: bug, error } = await supabase
    .from("bugs")
    // sequence_number has no DB-level default -- it's assigned by the
    // bugs_set_sequence_number BEFORE INSERT trigger, which overwrites
    // whatever is sent here. TypeScript still requires the field since
    // there's no schema default it can see.
    .insert({ ...bugFields, reporter_id: user.id, sequence_number: 0 })
    .select("id")
    .single();
  if (error || !bug) return { error: "Couldn't create bug.", bugId: null };

  if (labels.length > 0) {
    await supabase.from("bug_labels").insert(labels.map((label) => ({ bug_id: bug.id, label })));
  }

  await supabase
    .from("bug_activity")
    .insert({ bug_id: bug.id, actor_id: user.id, action: "created this bug" });

  if (bugFields.assignee_id) {
    await notify({
      recipientId: bugFields.assignee_id,
      actorId: user.id,
      type: "bug_assigned",
      message: `You were assigned to "${bugFields.title}".`,
      bugId: bug.id as string,
    });
  }

  return { error: null, bugId: bug.id as string };
}

type UpdateBugInput = Pick<
  TablesUpdate<"bugs">,
  | "title"
  | "steps_to_reproduce"
  | "expected_result"
  | "actual_result"
  | "additional_context"
  | "severity"
  | "priority"
  | "source"
  | "assignee_id"
> & { labels: BugLabel[] };

export async function updateBug(bugId: string, input: UpdateBugInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { labels, ...bugFields } = input;

  const { data: previous } = await supabase
    .from("bugs")
    .select("assignee_id")
    .eq("id", bugId)
    .single();

  const { error } = await supabase.from("bugs").update(bugFields).eq("id", bugId);
  if (error) return { error: "Couldn't update bug." };

  await supabase.from("bug_labels").delete().eq("bug_id", bugId);
  if (labels.length > 0) {
    await supabase.from("bug_labels").insert(labels.map((label) => ({ bug_id: bugId, label })));
  }

  await supabase
    .from("bug_activity")
    .insert({ bug_id: bugId, actor_id: user.id, action: "edited this bug" });

  if (bugFields.assignee_id && bugFields.assignee_id !== previous?.assignee_id) {
    await notify({
      recipientId: bugFields.assignee_id,
      actorId: user.id,
      type: "bug_assigned",
      message: `You were assigned to "${bugFields.title}".`,
      bugId,
    });
  }

  return { error: null };
}

export async function addComment(bugId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("bug_comments")
    .insert({ bug_id: bugId, author_id: user.id, body });
  if (error) return { error: "Couldn't add comment." };

  const { data: bug } = await supabase
    .from("bugs")
    .select("title, assignee_id, reporter_id, project_id")
    .eq("id", bugId)
    .single();

  if (bug) {
    const recipients = new Set(
      [bug.assignee_id, bug.reporter_id].filter((id): id is string => !!id),
    );
    for (const recipientId of recipients) {
      await notify({
        recipientId,
        actorId: user.id,
        type: "comment_added",
        message: `New comment on "${bug.title}".`,
        bugId,
      });
    }

    const mentionMatches = body.match(/@([\w.-]+(?:\s[\w.-]+)?)/g);
    if (mentionMatches && mentionMatches.length > 0) {
      const { data: members } = await supabase
        .from("project_members")
        .select("profile:profiles(id, full_name)")
        .eq("project_id", bug.project_id);

      for (const member of members ?? []) {
        const profile = member.profile as { id: string; full_name: string } | null;
        if (!profile || recipients.has(profile.id)) continue;
        const isMentioned = mentionMatches.some(
          (m) => m.slice(1).trim().toLowerCase() === profile.full_name.toLowerCase(),
        );
        if (isMentioned) {
          await notify({
            recipientId: profile.id,
            actorId: user.id,
            type: "mentioned",
            message: `You were mentioned in a comment on "${bug.title}".`,
            bugId,
          });
        }
      }
    }
  }

  return { error: null };
}

export async function updateBugStatus(bugId: string, status: Bug["status"]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: current } = await supabase
    .from("bugs")
    .select("status, title, assignee_id, reporter_id")
    .eq("id", bugId)
    .single();

  const { error } = await supabase.from("bugs").update({ status }).eq("id", bugId);
  if (error) return { error: "Couldn't update status." };

  if (current && current.status !== status) {
    await supabase.from("bug_activity").insert({
      bug_id: bugId,
      actor_id: user.id,
      action: "changed status",
      detail: `${STATUS_LABELS[current.status]} → ${STATUS_LABELS[status]}`,
    });

    const wasClosed = current.status === "resolved" || current.status === "closed";
    const isReopened = wasClosed && (status === "open" || status === "in_progress");

    const recipients = new Set(
      [current.assignee_id, current.reporter_id].filter((id): id is string => !!id),
    );
    for (const recipientId of recipients) {
      await notify({
        recipientId,
        actorId: user.id,
        type: isReopened ? "bug_reopened" : "status_changed",
        message: isReopened
          ? `"${current.title}" was reopened.`
          : `"${current.title}" status changed to ${STATUS_LABELS[status]}.`,
        bugId,
      });
    }
  }

  return { error: null };
}

export async function addAttachment(bugId: string, file: File) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const path = `${bugId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("bug-attachments").upload(path, file);
  if (uploadError) return { error: "Couldn't upload file." };

  const { error } = await supabase.from("bug_attachments").insert({
    bug_id: bugId,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    uploaded_by: user.id,
  });
  return { error: error ? "Couldn't save attachment record." : null };
}
