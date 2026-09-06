"use client";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const projects = [
  { id: "icma", name: "ICore Mobile App" },
  { id: "pgap", name: "Payment Gateway API" },
  { id: "lcrm", name: "Legacy CRM Migration" },
];

type UserFormValues = {
  name?: string;
  email?: string;
  role?: string;
  status?: "active" | "inactive";
  projects?: string[] | "all";
};

export function UserForm({
  mode,
  defaultValues,
}: {
  mode: "create" | "edit";
  defaultValues?: UserFormValues;
}) {
  const router = useRouter();
  const allProjects = defaultValues?.projects === "all" || defaultValues === undefined;
  const selectedProjects = Array.isArray(defaultValues?.projects) ? defaultValues.projects : [];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success(
      mode === "create"
        ? `${(new FormData(e.currentTarget).get("name") as string) || "User"} created`
        : "User updated",
    );
    router.push("/users");
  }

  return (
    <form onSubmit={handleSubmit} className="border-border bg-card space-y-6 rounded-lg border p-6">
      <div className="space-y-1.5">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback>
              {defaultValues?.name ? defaultValues.name[0] : <UserRound className="size-6" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button type="button" variant="outline" size="sm" render={<label htmlFor="photo" />}>
              Upload Photo
            </Button>
            <input id="photo" name="photo" type="file" accept="image/*" className="hidden" />
            <p className="text-muted-foreground mt-1 text-xs">JPG or PNG, max 2MB.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Jane Smith"
            defaultValue={defaultValues?.name}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane.smith@icore.app"
            defaultValue={defaultValues?.email}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password">{mode === "create" ? "Password *" : "New Password"}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={mode === "edit" ? "Leave blank to keep current password" : undefined}
            required={mode === "create"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role *</Label>
          <Select
            name="role"
            defaultValue={defaultValues?.role ?? "developer"}
            items={{ admin: "Admin", developer: "Developer", qa: "QA" }}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Projects</Label>
        <div className="border-border space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Checkbox id="project-all" name="projects" value="all" defaultChecked={allProjects} />
            <Label htmlFor="project-all" className="font-normal">
              All Projects
            </Label>
          </div>
          <div className="border-border ml-1 space-y-2 border-l pl-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-2">
                <Checkbox
                  id={`project-${project.id}`}
                  name="projects"
                  value={project.id}
                  defaultChecked={selectedProjects.includes(project.id)}
                />
                <Label
                  htmlFor={`project-${project.id}`}
                  className="text-muted-foreground font-normal"
                >
                  {project.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Switch
          id="status"
          name="status"
          defaultChecked={(defaultValues?.status ?? "active") === "active"}
        />
        <Label htmlFor="status" className="font-normal">
          Active
        </Label>
        <span className="text-muted-foreground text-xs">
          Inactive users cannot log in or be assigned new bugs.
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/users")}>
          Cancel
        </Button>
        <Button type="submit">{mode === "create" ? "Create User" : "Save Changes"}</Button>
      </div>
    </form>
  );
}
