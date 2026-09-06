"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { addCommentAction } from "@/app/(dashboard)/bugs/[id]/actions";

export function CommentForm({ bugId }: { bugId: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    const { error } = await addCommentAction(bugId, value.trim());
    setPending(false);
    if (error) {
      toast.error(error);
      return;
    }
    setValue("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <Textarea
        placeholder="Add a comment..."
        className="min-h-20"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!value.trim() || pending}>
          {pending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
