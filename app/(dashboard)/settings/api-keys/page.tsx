import { redirect } from "next/navigation";

import { ApiKeysManager } from "@/components/shared/api-keys-manager";
import { getCurrentProfile } from "@/services/profile";
import { getApiKeys } from "@/services/api-keys";
import { getAllProjectsBasic } from "@/services/projects";

export default async function ApiKeysPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    redirect("/settings");
  }

  const [keys, projects] = await Promise.all([getApiKeys(), getAllProjectsBasic()]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <span>Settings</span> <span className="mx-1">&gt;</span> <span>API Keys</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Lets an external tool (a Playwright test run, a CI job) file bugs directly into a
          project. Each key is scoped to one project and reports bugs as{" "}
          <span className="font-medium">Automation</span>.
        </p>
      </div>

      <ApiKeysManager keys={keys} projects={projects} />
    </div>
  );
}
