import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const notificationPrefs = [
  { id: "assigned", label: "Bug assigned to me" },
  { id: "status", label: "Bug status changed" },
  { id: "comment", label: "Comment added" },
  { id: "mention", label: "Mentioned in a comment" },
  { id: "reopened", label: "Bug reopened" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and workspace preferences.
        </p>
      </div>

      <section className="border-border bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div className="space-y-1.5">
          <Label htmlFor="settings-name">Full Name</Label>
          <Input id="settings-name" name="name" defaultValue="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-email">Work Email</Label>
          <Input
            id="settings-email"
            name="email"
            type="email"
            defaultValue="jane.smith@icore.app"
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </section>

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
