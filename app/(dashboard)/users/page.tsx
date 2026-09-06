"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search, UserPlus, UsersRound } from "lucide-react";

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

const roleStyles: Record<string, string> = {
  Admin: "bg-blue-100 text-blue-700",
  Developer: "bg-violet-100 text-violet-700",
  QA: "bg-amber-100 text-amber-700",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const users = [
  {
    id: "jane-smith",
    name: "Jane Smith",
    email: "jane.smith@icore.app",
    role: "Admin",
    projects: "All Projects",
    activeBugs: 0,
    status: "Active",
  },
  {
    id: "alex-kim",
    name: "Alex Kim",
    email: "alex.k@icore.app",
    role: "Developer",
    projects: "Core API, Auth Service",
    activeBugs: 12,
    status: "Active",
  },
  {
    id: "maria-rodriguez",
    name: "Maria Rodriguez",
    email: "maria.r@icore.app",
    role: "QA",
    projects: "Frontend App, Mobile",
    activeBugs: 3,
    status: "Inactive",
  },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all-roles");
  const [status, setStatus] = useState("all-status");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all-roles" && user.role.toLowerCase() !== role) return false;
      if (status !== "all-status" && user.status.toLowerCase() !== status) return false;
      if (
        query &&
        !user.name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [search, role, status]);

  const hasActiveFilters = search !== "" || role !== "all-roles" || status !== "all-status";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage system access, roles, and project assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download /> Export
          </Button>
          <Button render={<Link href="/users/new" />}>
            <UserPlus /> Add User
          </Button>
        </div>
      </div>

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
          items={{ "all-roles": "All Roles", admin: "Admin", developer: "Developer", qa: "QA" }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-roles">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="qa">QA</SelectItem>
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
            title="No users match your filters"
            description="Try a different search term, or clear the role and status filters."
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
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={`border-transparent ${roleStyles[user.role]}`}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-5 py-3">{user.projects}</td>
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
                        {user.status}
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
            <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-sm">
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon-sm" disabled>
                  &lt;
                </Button>
                <Button variant="outline" size="icon-sm" disabled>
                  &gt;
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
