"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const notifications = [
  { title: "Bug assigned to you", detail: "IC-4921 — Payment gateway timeout", time: "2h ago" },
  { title: "Status changed", detail: "IC-4918 moved to In Progress", time: "4h ago" },
  { title: "New comment", detail: "A. Lee commented on IC-4905", time: "Yesterday" },
];

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-muted-foreground text-xs">{n.detail}</span>
                <span className="text-muted-foreground text-[0.7rem]">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/profile" />}>Jane Smith</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
