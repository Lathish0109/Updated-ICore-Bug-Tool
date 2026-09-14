"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createApiKeyAction, revokeApiKeyAction } from "@/app/(dashboard)/settings/api-keys/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiKeyWithProject } from "@/services/api-keys";

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiKeysManager({
  keys,
  projects,
}: {
  keys: ApiKeyWithProject[];
  projects: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function handleCreate() {
    if (!name.trim() || !projectId) return;
    startTransition(async () => {
      const { error, key } = await createApiKeyAction({ name: name.trim(), projectId });
      if (error || !key) {
        toast.error(error ?? "Couldn't create the key.");
        return;
      }
      setRevealedKey(key);
      setShowForm(false);
      setName("");
      setProjectId("");
    });
  }

  function handleRevoke(id: string) {
    setRevokingId(id);
    startTransition(async () => {
      const { error } = await revokeApiKeyAction(id);
      if (error) toast.error(error);
      setRevokingId(null);
    });
  }

  async function copyKey() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    toast.success("Copied");
  }

  return (
    <div className="space-y-4">
      {revealedKey ? (
        <div className="border-primary bg-accent space-y-3 rounded-lg border-2 p-5">
          <p className="text-sm font-semibold">Your new API key</p>
          <p className="text-muted-foreground text-sm">
            Copy it now -- for your security, this is the only time it will ever be shown.
          </p>
          <div className="flex items-center gap-2">
            <code
              data-testid="revealed-api-key"
              className="bg-background border-border flex-1 truncate rounded-md border px-3 py-2 text-sm"
            >
              {revealedKey}
            </code>
            <Button type="button" variant="outline" size="icon" onClick={copyKey} aria-label="Copy key">
              <Copy />
            </Button>
          </div>
          <Button type="button" size="sm" onClick={() => setRevealedKey(null)}>
            I&apos;ve copied it
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {keys.length} key{keys.length === 1 ? "" : "s"}
        </p>
        {!showForm && (
          <Button type="button" size="sm" onClick={() => setShowForm(true)}>
            <Plus /> Generate New Key
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="border-border bg-card space-y-3 rounded-lg border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              placeholder="e.g., Playwright CI"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key-project">Project</Label>
            <Select
              value={projectId}
              onValueChange={(v) => setProjectId((v as string) ?? "")}
              items={Object.fromEntries(projects.map((p) => [p.id, p.name]))}
            >
              <SelectTrigger id="key-project" className="w-full">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending || !name.trim() || !projectId}
              onClick={handleCreate}
            >
              {isPending ? "Creating..." : "Create Key"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-border bg-card overflow-x-auto rounded-lg border">
        {keys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Generate one to let an external tool file bugs into a project."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-left text-xs">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Key</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last Used</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-border border-b last:border-0">
                  <td className="px-5 py-3 font-medium">{key.name}</td>
                  <td className="text-muted-foreground px-5 py-3">{key.projectName}</td>
                  <td className="text-muted-foreground px-5 py-3 font-mono text-xs">
                    {key.keyPrefix}...
                  </td>
                  <td className="text-muted-foreground px-5 py-3 text-xs">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="text-muted-foreground px-5 py-3 text-xs">
                    {formatDate(key.lastUsedAt)}
                  </td>
                  <td className="px-5 py-3">
                    {key.revokedAt ? (
                      <Badge variant="outline" className="border-transparent bg-slate-500/15 text-slate-400">
                        Revoked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-400">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!key.revokedAt && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Revoke ${key.name}`}
                        disabled={isPending && revokingId === key.id}
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
