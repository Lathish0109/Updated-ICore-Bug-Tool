"use server";

import { markAllNotificationsRead } from "@/services/notifications";

export async function markAllNotificationsReadAction() {
  await markAllNotificationsRead();
}
