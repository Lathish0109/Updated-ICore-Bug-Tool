"use client";

import { useState, useTransition } from "react";

import { updateNotificationPreferences } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { NotificationType } from "@/services/notifications";

const FIELDS: { id: NotificationType; label: string }[] = [
  { id: "bug_assigned", label: "Bug assigned to me" },
  { id: "status_changed", label: "Bug status changed" },
  { id: "comment_added", label: "Comment added" },
  { id: "mentioned", label: "Mentioned in a comment" },
  { id: "bug_reopened", label: "Bug reopened" },
];

const DEFAULT_PREFS: Record<NotificationType, boolean> = {
  bug_assigned: true,
  status_changed: true,
  comment_added: true,
  mentioned: true,
  bug_reopened: true,
};

export function NotificationPreferencesForm({
  initialPrefs,
}: {
  initialPrefs: Partial<Record<NotificationType, boolean>>;
}) {
  const [prefs, setPrefs] = useState<Record<NotificationType, boolean>>({
    ...DEFAULT_PREFS,
    ...initialPrefs,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(id: NotificationType) {
    setSaved(false);
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSave() {
    startTransition(async () => {
      const { error } = await updateNotificationPreferences(prefs);
      setSaved(!error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {FIELDS.map(({ id, label }) => (
          <div key={id} className="flex items-center gap-2">
            <Checkbox id={id} checked={prefs[id]} onCheckedChange={() => toggle(id)} />
            <Label htmlFor={id} className="text-muted-foreground font-normal">
              {label}
            </Label>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved.</span>}
      </div>
    </div>
  );
}
