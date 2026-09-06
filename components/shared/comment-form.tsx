"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm() {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    toast.success("Comment added");
    setValue("");
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
        <Button type="submit" size="sm" disabled={!value.trim()}>
          Comment
        </Button>
      </div>
    </form>
  );
}
