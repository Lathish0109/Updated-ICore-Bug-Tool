"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type FormState = { error?: string } | undefined;

export function EditProjectForm({
  projectId,
  defaultValues,
  candidates,
  action,
}: {
  projectId: string;
  defaultValues: {
    name: string;
    key: string;
    description: string;
    status: "active" | "archived";
    memberIds: string[];
  };
  candidates: { id: string; full_name: string; role: string }[];
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Projects</span> <span className="mx-1">&gt;</span> <span>Edit</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Project</h1>
      </div>

      <form action={formAction} className="border-border bg-card space-y-4 rounded-lg border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Customer Portal Redesign"
            defaultValue={defaultValues.name}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="key">Project Key *</Label>
          <Input
            id="key"
            name="key"
            placeholder="e.g., CPR"
            maxLength={6}
            defaultValue={defaultValues.key}
            required
          />
          <p className="text-muted-foreground text-xs">
            Short prefix used on bug IDs, e.g. CPR-101.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What is this project about?"
            defaultValue={defaultValues.description}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Switch id="status" name="status" defaultChecked={defaultValues.status === "active"} />
          <Label htmlFor="status" className="font-normal">
            Active
          </Label>
          <span className="text-muted-foreground text-xs">
            Archived projects stay visible but are hidden from active filters.
          </span>
        </div>

        <div className="space-y-1.5">
          <Label>Members</Label>
          <div className="border-border space-y-2 rounded-lg border p-3">
            {candidates.length > 0 ? (
              candidates.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`member-${user.id}`}
                    name="members"
                    value={user.id}
                    defaultChecked={defaultValues.memberIds.includes(user.id)}
                  />
                  <Label
                    htmlFor={`member-${user.id}`}
                    className="text-muted-foreground font-normal"
                  >
                    {user.full_name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs">No assignable users yet.</p>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Admins and managers always have access and aren&apos;t listed here.
          </p>
        </div>

        {state?.error ? (
          <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" render={<Link href={`/projects/${projectId}`} />}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
