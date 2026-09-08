"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RANGE_OPTIONS } from "@/lib/date-range";

export function ReportsFilterBar({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setPreset(value: string) {
    pushParams({ range: value, from: null, to: null });
  }

  function setCustomDate(key: "from" | "to", value: string) {
    pushParams({ [key]: value || null, range: null });
  }

  const project = searchParams.get("project") ?? "all-projects";
  const range = searchParams.get("range") ?? "30d";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const usingCustomRange = Boolean(from || to);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-44">
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
        <Label className="mb-1.5 block">From</Label>
        <Input type="date" value={from} onChange={(e) => setCustomDate("from", e.target.value)} />
      </div>
      <div className="w-36">
        <Label className="mb-1.5 block">To</Label>
        <Input type="date" value={to} onChange={(e) => setCustomDate("to", e.target.value)} />
      </div>

      <div className="flex items-center gap-1.5 pb-0.5">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreset(option.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              !usingCustomRange && range === option.value
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
