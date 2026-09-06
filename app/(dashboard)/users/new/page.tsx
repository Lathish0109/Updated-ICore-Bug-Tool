import { UserForm } from "@/components/shared/user-form";

export default function NewUserPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Users</span> <span className="mx-1">&gt;</span> <span>Add New</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Add New User</h1>
      </div>

      <UserForm mode="create" />
    </div>
  );
}
