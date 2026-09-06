import { UserForm } from "@/components/shared/user-form";
import { getAllProjectsBasic } from "@/services/projects";

import { createUserFormAction } from "./actions";

export default async function NewUserPage() {
  const projects = await getAllProjectsBasic();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Users</span> <span className="mx-1">&gt;</span> <span>Add New</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Add New User</h1>
      </div>

      <UserForm mode="create" projects={projects} action={createUserFormAction} />
    </div>
  );
}
