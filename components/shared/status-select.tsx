"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, type Bug } from "@/lib/bug-constants";

import { updateStatusAction } from "@/app/(dashboard)/bugs/[id]/actions";

const statusTriggerStyles: Record<Bug["status"], string> = {
  open: "bg-[#ff6f61]/15 text-[#ff6f61]",
  in_progress: "bg-amber-500/15 text-amber-400",
  resolved: "bg-cyan-500/15 text-cyan-300",
  closed: "bg-emerald-500/15 text-emerald-400",
};

export function StatusSelect({ bugId, status }: { bugId: string; status: Bug["status"] }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [pending, setPending] = useState(false);

  async function handleChange(value: string | null) {
    if (!value) return;
    const next = value as Bug["status"];
    setPending(true);
    const { error } = await updateStatusAction(bugId, next);
    setPending(false);
    if (error) {
      toast.error(error);
      return;
    }
    setCurrent(next);
    router.refresh();
  }

  return (
    <Select value={current} onValueChange={handleChange} items={STATUS_LABELS}>
      <SelectTrigger
        data-testid="status-select-trigger"
        disabled={pending}
        className={`border-transparent font-medium ${statusTriggerStyles[current]}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
