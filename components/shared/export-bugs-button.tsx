"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

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
import { STATUS_LABELS } from "@/lib/bug-constants";

export function ExportBugsButton({
  projects,
  defaultFrom,
  defaultTo,
}: {
  projects: { id: string; name: string }[];
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("all-projects");
  const [status, setStatus] = useState("all-status");
  const [from, setFrom] = useState(defaultFrom ?? "");
  const [to, setTo] = useState(defaultTo ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDownload() {
    const params = new URLSearchParams();
    if (projectId !== "all-projects") params.set("project", projectId);
    if (status !== "all-status") params.set("status", status);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59`).toISOString());
    // Not a page navigation -- this route returns a CSV file with
    // Content-Disposition: attachment, so a router push would break the download.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/export/bugs?${params.toString()}`;
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        <Download /> Export CSV
      </Button>

      {open && (
        <div className="border-border bg-popover absolute top-full right-0 z-50 mt-1.5 w-72 space-y-3 rounded-lg border p-4 shadow-md">
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(v) => setProjectId(v as string)}
              items={{
                "all-projects": "All Projects",
                ...Object.fromEntries(projects.map((p) => [p.id, p.name])),
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as string)}
              items={{ "all-status": "All Status", ...STATUS_LABELS }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <Button className="w-full" onClick={handleDownload}>
            <Download /> Download CSV
          </Button>
        </div>
      )}
    </div>
  );
}
