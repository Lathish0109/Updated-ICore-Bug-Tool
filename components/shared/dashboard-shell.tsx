"use client";

import { useState, type ReactNode } from "react";

import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppTopbar } from "@/components/shared/app-topbar";
import type { Profile } from "@/services/profile";

export function DashboardShell({ children, profile }: { children: ReactNode; profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen min-w-0 overflow-hidden">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar onMenuClick={() => setMobileOpen(true)} profile={profile} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
