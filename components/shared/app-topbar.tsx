"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";

import { markAllNotificationsReadAction } from "@/app/(dashboard)/notification-actions";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/services/profile";
import type { NotificationType } from "@/services/notifications";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  bugId: string | null;
  createdAt: string;
  actorName: string | null;
};

const TYPE_LABELS: Record<NotificationType, string> = {
  bug_assigned: "Bug assigned",
  status_changed: "Status changed",
  comment_added: "New comment",
  mentioned: "You were mentioned",
  bug_reopened: "Bug reopened",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function AppTopbar({
  onMenuClick,
  profile,
  notifications,
  unreadCount,
}: {
  onMenuClick: () => void;
  profile: Profile;
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [unread, setUnread] = useState(unreadCount);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleNotificationsOpen(open: boolean) {
    if (open && unread > 0) {
      setUnread(0);
      await markAllNotificationsReadAction();
      router.refresh();
    }
  }

  return (
    <header className="border-border bg-background flex h-16 shrink-0 items-center gap-4 border-b px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu />
      </Button>

      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input placeholder="Search bugs, projects, or users..." className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu onOpenChange={handleNotificationsOpen}>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell />
                {unread > 0 && (
                  <Badge
                    variant="outline"
                    className="absolute top-0.5 right-0.5 h-4 min-w-4 justify-center border-transparent bg-red-500 px-1 text-[0.65rem] text-white"
                  >
                    {unread > 9 ? "9+" : unread}
                  </Badge>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex-col items-start gap-0.5 py-2"
                  render={n.bugId ? <Link href={`/bugs/${n.bugId}`} /> : undefined}
                >
                  <span className="text-sm font-medium">{TYPE_LABELS[n.type]}</span>
                  <span className="text-muted-foreground text-xs">{n.message}</span>
                  <span className="text-muted-foreground text-[0.7rem]">
                    {timeAgo(n.createdAt)}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/profile" />}>
              {profile.full_name}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
