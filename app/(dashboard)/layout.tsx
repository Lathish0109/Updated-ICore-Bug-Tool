import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getCurrentProfile } from "@/services/profile";
import { getNotifications } from "@/services/notifications";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  // Defense in depth -- middleware already redirects unauthenticated
  // requests, but a layout-level check keeps this route group safe even if
  // the middleware matcher is ever changed.
  if (!profile) {
    redirect("/login");
  }

  const { notifications, unreadCount } = await getNotifications();

  return (
    <DashboardShell profile={profile} notifications={notifications} unreadCount={unreadCount}>
      {children}
    </DashboardShell>
  );
}
