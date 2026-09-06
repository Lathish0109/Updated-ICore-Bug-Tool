"use client";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewProjectPage() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name") as string;
    toast.success(`${name || "Project"} created`);
    router.push("/projects");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Projects</span> <span className="mx-1">&gt;</span> <span>Create New</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Create Project</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card space-y-4 rounded-lg border p-6"
      >
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
            Cancel
          </Button>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </div>
  );
}
