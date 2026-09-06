import { Save, Upload } from "lucide-react";

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

export default function NewBugPage() {
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
          <Button variant="outline">Cancel</Button>
          <Button variant="outline">
            <Save /> Save Draft
          </Button>
        </div>
      </div>

      <form className="border-border bg-card space-y-5 rounded-lg border p-6">
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
              name="project"
              items={{
                icma: "ICore Mobile App",
                pgap: "Payment Gateway API",
                lcrm: "Legacy CRM Migration",
              }}
            >
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder="Select Project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icma">ICore Mobile App</SelectItem>
                <SelectItem value="pgap">Payment Gateway API</SelectItem>
                <SelectItem value="lcrm">Legacy CRM Migration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source">Bug Source</Label>
            <Select
              name="source"
              defaultValue="manual"
              items={{ manual: "Manual QA", automation: "Automation", user: "User Reported" }}
            >
              <SelectTrigger id="source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual QA</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="user">User Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="severity">Severity *</Label>
            <Select
              name="severity"
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select
              name="priority"
              defaultValue="p2"
              items={{
                p1: "P1 - Critical",
                p2: "P2 - High",
                p3: "P3 - Medium",
                p4: "P4 - Low",
              }}
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              name="assignee"
              defaultValue="unassigned"
              items={{
                unassigned: "Unassigned",
                jane: "Jane Smith",
                alex: "Alex Kim",
                maria: "Maria Rodriguez",
              }}
            >
              <SelectTrigger id="assignee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
                <SelectItem value="alex">Alex Kim</SelectItem>
                <SelectItem value="maria">Maria Rodriguez</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <div className="border-border flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center">
            <Upload className="text-muted-foreground size-6" />
            <p className="text-muted-foreground text-sm">
              Drag and drop screenshots, logs, or videos here
            </p>
            <p className="text-muted-foreground text-xs">or click to browse files (Max 50MB)</p>
            <Button type="button" variant="outline" size="sm" className="mt-1">
              Select Files
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit">Create Bug</Button>
        </div>
      </form>
    </div>
  );
}
