"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/services/profile";

export function ProfileForms({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleNameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (new FormData(e.currentTarget).get("name") as string).trim();
    if (!name) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", profile.id);
    if (error) {
      toast.error("Couldn't update profile");
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = data.get("currentPassword") as string;
    const newPassword = data.get("newPassword") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation don't match");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });
    if (verifyError) {
      toast.error("Current password is incorrect");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Couldn't update password");
      return;
    }
    toast.success("Password updated");
    form.reset();
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const path = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadError) {
      toast.error("Couldn't upload photo");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);
    if (error) {
      toast.error("Couldn't save photo");
      return;
    }
    toast.success("Photo updated");
    router.refresh();
  }

  return (
    <>
      <section className="border-border bg-card space-y-4 rounded-lg border p-6">
        <h2 className="text-sm font-semibold">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            ) : null}
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
              onChange={handlePhotoChange}
            />
            <p className="text-muted-foreground mt-1 text-xs">JPG or PNG, max 2MB.</p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleNameSubmit}
        className="border-border bg-card space-y-4 rounded-lg border p-6"
      >
        <h2 className="text-sm font-semibold">Name</h2>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full Name</Label>
          <Input id="profile-name" name="name" defaultValue={profile.full_name} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Save Changes
          </Button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="border-border bg-card space-y-4 rounded-lg border p-6"
      >
        <h2 className="text-sm font-semibold">Reset Password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" name="currentPassword" type="password" required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" name="newPassword" type="password" required minLength={6} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Reset Password
          </Button>
        </div>
      </form>
    </>
  );
}
