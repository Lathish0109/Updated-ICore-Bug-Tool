import { redirect } from "next/navigation";

import { ProfileForms } from "@/components/shared/profile-forms";
import { getCurrentProfile } from "@/services/profile";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your personal account details.</p>
      </div>

      <ProfileForms profile={profile} />
    </div>
  );
}
