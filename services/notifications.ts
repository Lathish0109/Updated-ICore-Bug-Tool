import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type NotificationType = Enums<"notification_type">;

type ProfileRef = { full_name: string } | null;

export async function getNotifications(limit = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { notifications: [], unreadCount: 0 };

  const [{ data: notifications }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*, actor:profiles!notifications_actor_id_fkey(full_name)")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false),
  ]);

  return {
    notifications: (notifications ?? []).map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      isRead: n.is_read,
      bugId: n.bug_id,
      createdAt: n.created_at,
      actorName: (n.actor as ProfileRef)?.full_name ?? null,
    })),
    unreadCount: unreadCount ?? 0,
  };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);
}

/**
 * Creates a notification for `recipientId`, unless they've turned that
 * category off in their preferences or the recipient is the actor
 * themselves (no self-notifications).
 */
export async function notify(params: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  message: string;
  bugId?: string;
}) {
  if (params.recipientId === params.actorId) return;

  const supabase = await createClient();

  const { data: recipient } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", params.recipientId)
    .single();

  const prefs = recipient?.notification_preferences as Record<string, boolean> | undefined;
  if (prefs && prefs[params.type] === false) return;

  await supabase.from("notifications").insert({
    recipient_id: params.recipientId,
    actor_id: params.actorId,
    type: params.type,
    message: params.message,
    bug_id: params.bugId,
  });
}
