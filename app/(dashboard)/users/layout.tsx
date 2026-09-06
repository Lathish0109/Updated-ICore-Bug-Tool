import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/services/profile";

export default async function UsersLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}
