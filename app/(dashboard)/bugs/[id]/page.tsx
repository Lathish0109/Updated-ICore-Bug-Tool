import { History } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommentForm } from "@/components/shared/comment-form";

const statusStyles: Record<string, string> = {
  Open: "bg-red-50 text-red-600",
  "In Progress": "bg-blue-50 text-blue-600",
  Resolved: "bg-blue-100 text-blue-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

const labels = ["Payment", "Performance"];

const comments = [
  {
    author: "A. Lee",
    time: "3h ago",
    text: "Reproduced on staging. Looks like the timeout is on the PSP callback, not our side.",
  },
  {
    author: "J. Smith",
    time: "1h ago",
    text: "Bumped the gateway timeout config to 30s, retesting now.",
  },
];

const activity = [
  { text: "J. Smith created this bug", time: "5h ago" },
  { text: "Status changed from New to Open", time: "5h ago" },
  { text: "Assigned to J. Smith", time: "4h ago" },
  { text: "Priority changed from High to Critical", time: "3h ago" },
];

export default async function BugDetailPage({ params }: PageProps<"/bugs/[id]">) {
  const { id } = await params;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground font-mono text-sm">{id}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment gateway timeout on checkout finalization
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="bg-muted text-muted-foreground border-transparent"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <Badge variant="outline" className={`border-transparent ${statusStyles.Open}`}>
          Open
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Priority</p>
          <p className="mt-1 text-sm font-medium">Critical</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Project</p>
          <p className="mt-1 text-sm font-medium">E-Commerce Core</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Assignee</p>
          <p className="mt-1 text-sm font-medium">J. Smith</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Source</p>
          <p className="mt-1 text-sm font-medium">Automation</p>
        </div>
      </div>

      <div className="border-border bg-card space-y-4 rounded-lg border p-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Steps to Reproduce
          </p>
          <p className="mt-1.5 text-sm whitespace-pre-line">
            {"1. Add item to cart\n2. Proceed to checkout\n3. Confirm payment via PSP"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Expected Result
            </p>
            <p className="mt-1.5 text-sm">Payment confirms within 5 seconds.</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Actual Result
            </p>
            <p className="mt-1.5 text-sm">
              Request times out after 10 seconds, order left pending.
            </p>
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-5">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Comments
        </p>
        <ul className="mt-3 space-y-4">
          {comments.map((comment, i) => (
            <li key={i} className="flex gap-3">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">
                  <span className="font-medium">{comment.author}</span>{" "}
                  <span className="text-muted-foreground text-xs">{comment.time}</span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <CommentForm />
      </div>

      <div className="border-border bg-card rounded-lg border p-5">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <History className="size-3.5" />
          Activity
        </p>
        <ul className="border-border relative mt-4 space-y-4 border-l pl-4">
          {activity.map((event, i) => (
            <li key={i} className="relative">
              <span className="bg-muted-foreground absolute top-1.5 -left-[21px] size-2 rounded-full" />
              <p className="text-sm">{event.text}</p>
              <p className="text-muted-foreground text-xs">{event.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
