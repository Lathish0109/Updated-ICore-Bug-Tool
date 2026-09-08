import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/services/profile";
import { exportBugsCsv } from "@/services/export";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const csv = await exportBugsCsv({
    projectId: searchParams.get("project") || undefined,
    status: searchParams.get("status") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bugs-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
