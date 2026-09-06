import { UserForm } from "@/components/shared/user-form";

const users: Record<
  string,
  {
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    projects: string[] | "all";
  }
> = {
  "jane-smith": {
    name: "Jane Smith",
    email: "jane.smith@icore.app",
    role: "admin",
    status: "active",
    projects: "all",
  },
  "alex-kim": {
    name: "Alex Kim",
    email: "alex.k@icore.app",
    role: "developer",
    status: "active",
    projects: ["icma", "pgap"],
  },
  "maria-rodriguez": {
    name: "Maria Rodriguez",
    email: "maria.r@icore.app",
    role: "qa",
    status: "inactive",
    projects: ["icma"],
  },
};

export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  const { id } = await params;
  const user = users[id];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Users</span> <span className="mx-1">&gt;</span> <span>Edit</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Edit ${user.name}` : "Edit User"}
        </h1>
      </div>

      <UserForm mode="edit" defaultValues={user} />
    </div>
  );
}
