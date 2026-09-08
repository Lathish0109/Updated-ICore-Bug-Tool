"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExportBugsButton({
  projectId,
  status,
  from,
  to,
}: {
  projectId?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  function handleDownload() {
    const params = new URLSearchParams();
    if (projectId) params.set("project", projectId);
    if (status) params.set("status", status);
    if (from) params.set("from", new Date(`${from}T00:00:00`).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59.999`).toISOString());
    // Not a page navigation -- this route returns a CSV file with
    // Content-Disposition: attachment, so a router push would break the download.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/export/bugs?${params.toString()}`;
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download /> Export CSV
    </Button>
  );
}
