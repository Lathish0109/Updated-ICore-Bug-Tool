"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/services/notifications";

export async function updateNotificationPreferences(prefs: Record<NotificationType, boolean>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: prefs })
    .eq("id", user.id);

  return { error: error ? "Couldn't save preferences." : null };
}
