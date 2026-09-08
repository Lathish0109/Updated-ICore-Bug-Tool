import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/services/profile";
import { globalSearch } from "@/services/search";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ bugs: [], projects: [], users: [] }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await globalSearch(query);

  if (profile.role !== "admin") {
    results.users = [];
  }

  return NextResponse.json(results);
}
