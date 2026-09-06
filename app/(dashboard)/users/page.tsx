import Link from "next/link";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UsersList } from "@/components/shared/users-list";
import { getUsers } from "@/services/users";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage system access, roles, and project assignments.
          </p>
        </div>
        <Button render={<Link href="/users/new" />}>
          <UserPlus /> Add User
        </Button>
      </div>

      <UsersList users={users} />
    </div>
  );
}
