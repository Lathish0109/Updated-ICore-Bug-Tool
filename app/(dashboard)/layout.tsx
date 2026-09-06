import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getCurrentProfile } from "@/services/profile";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  // Defense in depth -- middleware already redirects unauthenticated
  // requests, but a layout-level check keeps this route group safe even if
  // the middleware matcher is ever changed.
  if (!profile) {
    redirect("/login");
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
