"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createProjectAction } from "./actions";

export default function NewProjectPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createProjectAction, undefined);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Projects</span> <span className="mx-1">&gt;</span> <span>Create New</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Create Project</h1>
      </div>

      <form action={formAction} className="border-border bg-card space-y-4 rounded-lg border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Project Name *</Label>
          <Input id="name" name="name" placeholder="e.g., Customer Portal Redesign" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="key">Project Key *</Label>
          <Input id="key" name="key" placeholder="e.g., CPR" maxLength={6} required />
          <p className="text-muted-foreground text-xs">
            Short prefix used on bug IDs, e.g. CPR-101.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="What is this project about?" />
        </div>

        {state?.error ? (
          <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
