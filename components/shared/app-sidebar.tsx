"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bug,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/services/profile";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Profile["role"][];
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/bugs", label: "Bugs", icon: Bug },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppSidebar({
  mobileOpen,
  onClose,
  profile,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  profile: Profile;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(profile.role),
  );
  const canCreateBugs = profile.role !== "viewer";

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "border-border bg-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col border-r transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between px-5 pt-6 pb-5">
          <div>
            <span className="text-primary text-lg font-bold">ICore Tracker</span>
            <p className="text-muted-foreground text-xs">QA Engineering</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        {canCreateBugs ? (
          <div className="px-4">
            <Button
              render={<Link href="/bugs/new" onClick={onClose} />}
              className="w-full justify-center"
            >
              <Plus /> New Bug
            </Button>
          </div>
        ) : null}

        <nav aria-label="Primary" className="flex-1 space-y-1 px-3 pt-6">
          {visibleNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-border space-y-1 border-t px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
