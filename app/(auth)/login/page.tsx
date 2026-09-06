import { ArrowRight, Lock, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roleBadges = [
  { label: "SUPER ADMIN", className: "bg-[#E4E9FB] text-[#4F5FAD]" },
  { label: "DEVELOPER", className: "bg-[#F3E8FD] text-[#8B5CF6]" },
  { label: "TESTER", className: "bg-[#DCFCE7] text-[#16A34A]" },
];

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-foreground flex items-center justify-center gap-2 text-2xl font-bold">
            <span aria-hidden>🐛</span> ICore Tracker
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Precision Engineering &amp; Bug Tracking
          </p>
        </div>

        <div className="border-border my-6 border-t" />

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {roleBadges.map(({ label, className }) => (
            <Badge
              key={label}
              variant="outline"
              className={`border-transparent px-2.5 py-1 font-mono text-[0.65rem] font-medium ${className}`}
            >
              {label}
            </Badge>
          ))}
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="engineer@icore.dev"
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember" className="text-muted-foreground font-normal">
              Remember me for 30 days
            </Label>
          </div>

          <Button type="submit" className="h-10 w-full text-sm">
            Login <ArrowRight />
          </Button>
        </form>

        <div className="border-border my-6 border-t" />

        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          Secure connection established.
          <br />
          Access restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
}
