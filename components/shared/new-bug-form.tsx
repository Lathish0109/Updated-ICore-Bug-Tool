"use client";

import { useActionState, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";

import { Paperclip, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BugLabel } from "@/lib/bug-constants";

import { createBugFormAction } from "@/app/(dashboard)/bugs/new/actions";

const availableLabels: BugLabel[] = [
  "UI",
  "Functional",
  "API",
  "Performance",
  "Security",
  "Database",
  "Compatibility",
  "Regression",
];

export function NewBugForm({
  projects,
  assignees,
}: {
  projects: { id: string; name: string }[];
  assignees: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createBugFormAction, undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<BugLabel[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Every Select field below is fully controlled with its own explicit
  // hidden <input>, rather than relying on Base UI Select's built-in
  // name-based form participation -- same reliable pattern already used
  // for Labels. Guarantees FormData has the right value on submit
  // regardless of Select internals.
  const [project, setProject] = useState("");
  const [source, setSource] = useState("manual");
  const [severity, setSeverity] = useState("");
  const [priority, setPriority] = useState("p2");
  const [assignee, setAssignee] = useState("unassigned");

  function syncInputFiles(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setFiles((prev) => {
      const next = [...prev, ...Array.from(fileList)];
      syncInputFiles(next);
      return next;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      syncInputFiles(next);
      return next;
    });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }

  function toggleLabel(label: BugLabel) {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            <span>Bugs</span> <span className="mx-1">&gt;</span> <span>Create New</span>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Report New Issue</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/bugs")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Draft saving isn't available yet")}
          >
            <Save /> Save Draft
          </Button>
        </div>
      </div>

      <form action={formAction} className="border-border bg-card space-y-5 rounded-lg border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="title">Bug Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Application crashes on login with special characters"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={project}
              onValueChange={(v) => setProject((v as string) ?? "")}
              items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
            >
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder="Select Project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="project" value={project} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source">Bug Source</Label>
            <Select
              value={source}
              onValueChange={(v) => setSource((v as string) ?? "manual")}
              items={{
                manual: "Manual QA",
                automation: "Automation",
                user_reported: "User Reported",
              }}
            >
              <SelectTrigger id="source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual QA</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="user_reported">User Reported</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="source" value={source} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="severity">Severity *</Label>
            <Select
              value={severity}
              onValueChange={(v) => setSeverity((v as string) ?? "")}
              items={{ critical: "Critical", high: "High", medium: "Medium", low: "Low" }}
            >
              <SelectTrigger id="severity" className="w-full">
                <SelectValue placeholder="Select Severity..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="severity" value={severity} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority((v as string) ?? "p2")}
              items={{ p1: "P1 - Critical", p2: "P2 - High", p3: "P3 - Medium", p4: "P4 - Low" }}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">P1 - Critical</SelectItem>
                <SelectItem value="p2">P2 - High</SelectItem>
                <SelectItem value="p3">P3 - Medium</SelectItem>
                <SelectItem value="p4">P4 - Low</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="priority" value={priority} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={assignee}
              onValueChange={(v) => setAssignee((v as string) ?? "unassigned")}
              items={{
                unassigned: "Unassigned",
                ...Object.fromEntries(assignees.map((a) => [a.id, a.full_name])),
              }}
            >
              <SelectTrigger id="assignee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="assignee" value={assignee} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Labels</Label>
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((label) => {
              const selected = labels.includes(label);
              return (
                <Badge
                  key={label}
                  variant="outline"
                  onClick={() => toggleLabel(label)}
                  className={`cursor-pointer select-none ${
                    selected ? "bg-primary text-primary-foreground border-transparent" : ""
                  }`}
                >
                  {label}
                </Badge>
              );
            })}
          </div>
          {labels.map((label) => (
            <input key={label} type="hidden" name="labels" value={label} />
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="steps">Steps to Reproduce *</Label>
          <Textarea
            id="steps"
            name="steps"
            placeholder={"1. Go to...\n2. Click on...\n3. Observe..."}
            className="min-h-24"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="expected">Expected Result</Label>
            <Textarea id="expected" name="expected" placeholder="What should happen?" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actual">Actual Result</Label>
            <Textarea id="actual" name="actual" placeholder="What actually happened?" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="context">Additional Context</Label>
          <Textarea
            id="context"
            name="context"
            placeholder="Environment details, browser versions, related tickets..."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Attachments</Label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-border flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center"
          >
            <Upload className="text-muted-foreground size-6" />
            <p className="text-muted-foreground text-sm">
              Drag and drop screenshots, logs, or videos here
            </p>
            <p className="text-muted-foreground text-xs">or click to browse files (Max 50MB)</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              render={<label htmlFor="attachments" />}
            >
              Select Files
            </Button>
            <input
              id="attachments"
              name="attachments"
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
            />
          </div>
          {files.length > 0 ? (
            <ul className="space-y-1.5 pt-1">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      ({Math.max(1, Math.round(file.size / 1024))} KB)
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(i)}
                  >
                    <X className="text-muted-foreground hover:text-foreground size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {state?.error ? (
          <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={pending || !project || !severity}>
            {pending ? "Creating..." : "Create Bug"}
          </Button>
        </div>
      </form>
    </div>
  );
}
