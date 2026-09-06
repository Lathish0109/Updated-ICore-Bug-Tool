import Link from "next/link";
import { Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tabs = [
  { label: "All Projects", count: 12, active: true },
  { label: "Active", count: 8, active: false },
  { label: "Archived", count: 4, active: false },
];

const projects = [
  {
    id: "icma",
    initials: "IC",
    iconClassName: "bg-blue-600 text-white",
    name: "ICore Mobile App",
    status: "Active" as const,
    tag: "ICMA",
    description:
      "Quality assurance for the upcoming V2.0 mobile application release on iOS and Android platforms.",
    openBugs: 24,
    resolved7d: 112,
    members: ["Sarah J.", "+8"],
  },
  {
    id: "pgap",
    initials: "API",
    iconClassName: "bg-primary text-primary-foreground",
    name: "Payment Gateway API",
    status: "Active" as const,
    tag: "PGAP",
    description:
      "Security and integration testing for the new Stripe/PayPal unified payment microservice.",
    openBugs: 8,
    resolved7d: 45,
    members: ["David Chen", "+3"],
  },
  {
    id: "lcrm",
    initials: "LEG",
    iconClassName: "bg-rose-100 text-rose-500",
    name: "Legacy CRM Migration",
    status: "Archived" as const,
    tag: "LCRM",
    description:
      "Data integrity validation for the Q2 migration from Salesforce to internal tooling.",
    openBugs: 0,
    resolved7d: 892,
    members: ["Elena M.", "+12"],
  },
];

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Archived: "bg-slate-100 text-slate-600",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and monitor active QA initiatives.
          </p>
        </div>
        <Button render={<Link href="/projects/new" />}>
          <Plus /> Create Project
        </Button>
      </div>

      <div className="border-border flex gap-6 border-b text-sm">
        {tabs.map(({ label, count, active }) => (
          <button
            key={label}
            type="button"
            className={
              active
                ? "text-primary border-primary -mb-px border-b-2 pb-2 font-medium"
                : "text-muted-foreground pb-2"
            }
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="border-border bg-card hover:border-primary/40 flex flex-col rounded-lg border p-5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex size-9 items-center justify-center rounded-md text-xs font-semibold ${project.iconClassName}`}
              >
                {project.initials}
              </div>
              <Badge
                variant="outline"
                className={`border-transparent ${statusStyles[project.status]}`}
              >
                {project.status}
              </Badge>
            </div>

            <h2 className="mt-3 font-semibold">{project.name}</h2>
            <span className="text-muted-foreground w-fit font-mono text-[0.65rem]">
              {project.tag}
            </span>
            <p className="text-muted-foreground mt-2 flex-1 text-sm">{project.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Open Bugs</p>
                <p className="text-primary text-lg font-semibold">{project.openBugs}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Resolved (7d)</p>
                <p className="text-lg font-semibold text-emerald-600">{project.resolved7d}</p>
              </div>
            </div>

            <div className="border-border mt-4 flex items-center gap-2 border-t pt-3">
              <Avatar className="size-6">
                <AvatarFallback className="text-[0.65rem]">{project.members[0][0]}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs">{project.members[0]}</span>
              <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                {project.members[1]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
