"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UsersRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import type { UserWithStats } from "@/services/users";

const roleStyles: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  manager: "bg-indigo-100 text-indigo-700",
  developer: "bg-violet-100 text-violet-700",
  tester: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 text-slate-600",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  developer: "Developer",
  tester: "Tester",
  viewer: "Viewer",
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
};

export function UsersList({
  users,
  page,
  pageSize,
  totalCount,
}: {
  users: UserWithStats[];
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all-roles");
  const [status, setStatus] = useState("all-status");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all-roles" && user.role !== role) return false;
      if (status !== "all-status" && user.status !== status) return false;
      if (
        query &&
        !user.full_name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [users, search, role, status]);

  const hasActiveFilters = search !== "" || role !== "all-roles" || status !== "all-status";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Filter users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as string)}
          items={{ "all-roles": "All Roles", ...roleLabels }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-roles">All Roles</SelectItem>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as string)}
          items={{ "all-status": "All Status", active: "Active", inactive: "Inactive" }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border">
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={users.length === 0 ? "No users yet" : "No users match your filters"}
            description={
              users.length === 0
                ? "Add your first team member to get started."
                : "Try a different search term, or clear the role and status filters."
            }
            action={
              hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setRole("all-roles");
                    setStatus("all-status");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-border border-b text-left text-xs">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Projects</th>
                  <th className="px-5 py-3 font-medium">Active Bugs</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-border border-b last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-transparent ${roleStyles[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-5 py-3">
                      {user.role === "admin" || user.role === "manager"
                        ? "All Projects"
                        : user.projectNames.length > 0
                          ? user.projectNames.join(", ")
                          : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={user.activeBugs > 0 ? "text-amber-600" : "text-muted-foreground"}
                      >
                        {user.activeBugs}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-transparent ${statusStyles[user.status]}`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/users/${user.id}/edit`} />}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasActiveFilters ? (
              <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  Showing {filteredUsers.length} of {users.length} users on this page
                </span>
              </div>
            ) : (
              <PaginationControls
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                basePath="/users"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
