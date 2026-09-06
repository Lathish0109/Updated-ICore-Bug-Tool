import Link from "next/link";
import { Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusStyles: Record<string, string> = {
  Open: "bg-red-50 text-red-600",
  "In Progress": "bg-blue-50 text-blue-600",
  Resolved: "bg-blue-100 text-blue-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

const bugs = [
  { id: "ICMA-142", title: "Push notifications delayed on Android 14", status: "Open" },
  { id: "ICMA-138", title: "Crash on profile image upload over 10MB", status: "In Progress" },
  { id: "ICMA-121", title: "Dark mode toggle resets on app restart", status: "Resolved" },
];

const members = ["Sarah J.", "Marcus T.", "Priya N.", "Jordan K."];

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md text-sm font-semibold uppercase">
            {id.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">ICore Mobile App</h1>
            <p className="text-muted-foreground text-sm">
              Quality assurance for the upcoming V2.0 mobile application release.
            </p>
          </div>
        </div>
        <Button render={<Link href="/bugs/new" />}>
          <Plus /> New Bug
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Open Bugs</p>
          <p className="text-primary mt-1 text-2xl font-semibold">24</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Resolved (7d)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">112</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-sm">Members</p>
          <p className="mt-1 text-2xl font-semibold">{members.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border-border bg-card rounded-lg border lg:col-span-2">
          <p className="text-muted-foreground border-border border-b px-5 py-3 text-xs font-medium tracking-wide uppercase">
            Recent Bugs
          </p>
          <ul className="divide-border divide-y">
            {bugs.map((bug) => (
              <li key={bug.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-muted-foreground font-mono text-xs">{bug.id}</p>
                  <p className="text-sm font-medium">{bug.title}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`border-transparent ${statusStyles[bug.status]}`}
                >
                  {bug.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Members
          </p>
          <ul className="mt-3 space-y-3">
            {members.map((name) => (
              <li key={name} className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
