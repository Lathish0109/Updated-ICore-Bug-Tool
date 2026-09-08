"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

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

export function BugsFilterBar({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const isFirstRender = useRef(true);

  function pushParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => pushParams({ q: search || null }), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const status = searchParams.get("status") ?? "all";
  const project = searchParams.get("project") ?? "all-projects";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative min-w-56 flex-1">
        <Label className="mb-1.5 block">Search</Label>
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 mt-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by bug ID or title..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="w-40">
        <Label className="mb-1.5 block">Project</Label>
        <Select
          value={project}
          onValueChange={(v) =>
            pushParams({ project: v === "all-projects" ? null : (v as string) })
          }
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

      <div className="w-36">
        <Label className="mb-1.5 block">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => pushParams({ status: v === "all" ? null : (v as string) })}
          items={{ all: "All Status", ...STATUS_LABELS }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <Label className="mb-1.5 block">From</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => pushParams({ from: e.target.value || null })}
        />
      </div>
      <div className="w-36">
        <Label className="mb-1.5 block">To</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => pushParams({ to: e.target.value || null })}
        />
      </div>
    </div>
  );
}
