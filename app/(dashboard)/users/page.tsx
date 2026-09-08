import Link from "next/link";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UsersList } from "@/components/shared/users-list";
import { getUsers } from "@/services/users";

const PAGE_SIZE = 15;

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { users, totalCount } = await getUsers({ page, pageSize: PAGE_SIZE });

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

      <UsersList users={users} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
    </div>
  );
}
