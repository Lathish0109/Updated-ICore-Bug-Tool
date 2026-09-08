"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, FolderKanban, Loader2, Search, UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchResults = {
  bugs: { id: string; title: string; displayId: string }[];
  projects: { id: string; name: string; key: string }[];
  users: { id: string; name: string; email: string }[];
};

const EMPTY_RESULTS: SearchResults = { bugs: [], projects: [], users: [] };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await res.json()) as SearchResults;
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results.bugs.length + results.projects.length + results.users.length > 0;
  const showPanel = open && query.trim().length >= 2;

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search bugs, projects, or users..."
        className="pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.blur();
            setOpen(false);
          }
        }}
      />

      {showPanel && (
        <div className="border-border bg-popover absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-lg border shadow-md">
          {loading ? (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
              <Loader2 className="size-4 animate-spin" /> Searching...
            </div>
          ) : !hasResults ? (
            <p className="text-muted-foreground px-3 py-4 text-center text-sm">
              No matches for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {results.bugs.length > 0 && (
                <div>
                  <p className="text-muted-foreground px-3 py-1.5 text-xs font-medium tracking-wide uppercase">
                    Bugs
                  </p>
                  {results.bugs.map((bug) => (
                    <button
                      key={bug.id}
                      type="button"
                      onClick={() => goTo(`/bugs/${bug.id}`)}
                      className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    >
                      <Bug className="text-muted-foreground size-4 shrink-0" />
                      <span className="text-muted-foreground font-mono text-xs">
                        {bug.displayId}
                      </span>
                      <span className="truncate">{bug.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <p className="text-muted-foreground px-3 py-1.5 text-xs font-medium tracking-wide uppercase">
                    Projects
                  </p>
                  {results.projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => goTo(`/projects/${project.id}`)}
                      className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    >
                      <FolderKanban className="text-muted-foreground size-4 shrink-0" />
                      <span className="text-muted-foreground font-mono text-xs">{project.key}</span>
                      <span className="truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <p className="text-muted-foreground px-3 py-1.5 text-xs font-medium tracking-wide uppercase">
                    Users
                  </p>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => goTo(`/users/${user.id}/edit`)}
                      className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    >
                      <UserRound className="text-muted-foreground size-4 shrink-0" />
                      <span className="truncate">{user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
