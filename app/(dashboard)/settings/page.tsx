import { redirect } from "next/navigation";

import { NotificationPreferencesForm } from "@/components/shared/notification-preferences-form";
import { getCurrentProfile } from "@/services/profile";
import type { NotificationType } from "@/services/notifications";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const initialPrefs =
    (profile.notification_preferences as Partial<Record<NotificationType, boolean>> | null) ?? {};

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
        <NotificationPreferencesForm initialPrefs={initialPrefs} />
      </section>
    </div>
  );
}
