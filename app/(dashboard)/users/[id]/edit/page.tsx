import { notFound } from "next/navigation";

import { UserForm } from "@/components/shared/user-form";
import { getAllProjectsBasic } from "@/services/projects";
import { getUser } from "@/services/users";

import { updateUserFormAction } from "./actions";

export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  const { id } = await params;
  const [user, projects] = await Promise.all([getUser(id), getAllProjectsBasic()]);

  if (!user) notFound();

  const boundAction = updateUserFormAction.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Users</span> <span className="mx-1">&gt;</span> <span>Edit</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Edit {user.full_name}</h1>
      </div>

      <UserForm
        mode="edit"
        projects={projects}
        action={boundAction}
        defaultValues={{
          name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
          projects: user.role === "admin" || user.role === "manager" ? "all" : user.projectIds,
        }}
      />
    </div>
  );
}
