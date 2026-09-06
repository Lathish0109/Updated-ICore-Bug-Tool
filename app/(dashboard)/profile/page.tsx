import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your personal account details.</p>
      </div>

      <section className="border-border bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback>
              <UserRound className="size-7" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" render={<label htmlFor="profile-photo" />}>
              Upload Photo
            </Button>
            <input
              id="profile-photo"
              name="photo"
              type="file"
              accept="image/*"
              className="hidden"
            />
            <p className="text-muted-foreground mt-1 text-xs">JPG or PNG, max 2MB.</p>
          </div>
        </div>
      </section>

      <form className="border-border bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Name</h2>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full Name</Label>
          <Input id="profile-name" name="name" defaultValue="Jane Smith" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Save Changes
          </Button>
        </div>
      </form>

      <form className="border-border bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Reset Password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" name="currentPassword" type="password" required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" name="newPassword" type="password" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" name="confirmPassword" type="password" required />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  );
}
