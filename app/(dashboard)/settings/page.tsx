import { redirect } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getCurrentProfile } from "@/services/profile";

const notificationPrefs = [
  { id: "assigned", label: "Bug assigned to me" },
  { id: "status", label: "Bug status changed" },
  { id: "comment", label: "Comment added" },
  { id: "mention", label: "Mentioned in a comment" },
  { id: "reopened", label: "Bug reopened" },
];

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and workspace preferences.
        </p>
      </div>

      <section className="border-border bg-card space-y-3 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Notification Preferences</h2>
        <div className="space-y-2.5">
          {notificationPrefs.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox id={id} defaultChecked />
              <Label htmlFor={id} className="text-muted-foreground font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
