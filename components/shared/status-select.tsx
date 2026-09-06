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
  open: "bg-red-50 text-red-600",
  in_progress: "bg-blue-50 text-blue-600",
  resolved: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
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
