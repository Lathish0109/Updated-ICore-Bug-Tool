"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { deleteAttachmentAction } from "@/app/(dashboard)/bugs/[id]/attachment-actions";
import { Button } from "@/components/ui/button";

export function AttachmentDeleteButton({
  attachmentId,
  bugId,
  fileName,
}: {
  attachmentId: string;
  bugId: string;
  fileName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const { error } = await deleteAttachmentAction(attachmentId, bugId);
      if (error) toast.error(error);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Delete ${fileName}`}
      disabled={isPending}
      onClick={handleDelete}
    >
      <X />
    </Button>
  );
}
