import { History, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CommentForm } from "@/components/shared/comment-form";
import { StatusSelect } from "@/components/shared/status-select";
import { formatRelativeTime } from "@/lib/format";
import {
  displayId,
  getBug,
  getBugActivity,
  getBugAttachments,
  getBugComments,
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  SOURCE_LABELS,
} from "@/services/bugs";

export default async function BugDetailPage({ params }: PageProps<"/bugs/[id]">) {
  const { id } = await params;
  const bug = await getBug(id);
  if (!bug) notFound();

  const [comments, activity, attachments] = await Promise.all([
    getBugComments(id),
    getBugActivity(id),
    getBugAttachments(id),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground font-mono text-sm">
            {displayId(bug.projectKey, bug.sequence_number)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{bug.title}</h1>
          {bug.labels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bug.labels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="bg-muted text-muted-foreground border-transparent"
                >
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <StatusSelect bugId={bug.id} status={bug.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Priority</p>
          <p className="mt-1 text-sm font-medium">{PRIORITY_LABELS[bug.priority]}</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Project</p>
          <p className="mt-1 text-sm font-medium">{bug.projectName}</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Assignee</p>
          <p className="mt-1 text-sm font-medium">{bug.assigneeName ?? "Unassigned"}</p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Source</p>
          <p className="mt-1 text-sm font-medium">{SOURCE_LABELS[bug.source]}</p>
        </div>
      </div>

      <div className="border-border bg-card space-y-4 rounded-lg border p-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Steps to Reproduce
          </p>
          <p className="mt-1.5 text-sm whitespace-pre-line">{bug.steps_to_reproduce}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Expected Result
            </p>
            <p className="mt-1.5 text-sm">{bug.expected_result || "Not specified."}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Actual Result
            </p>
            <p className="mt-1.5 text-sm">{bug.actual_result || "Not specified."}</p>
          </div>
        </div>
        {bug.additional_context ? (
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Additional Context
            </p>
            <p className="mt-1.5 text-sm">{bug.additional_context}</p>
          </div>
        ) : null}
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Severity
          </p>
          <p className="mt-1.5 text-sm">{SEVERITY_LABELS[bug.severity]}</p>
        </div>
      </div>

      {attachments.length > 0 ? (
        <div className="border-border bg-card rounded-lg border p-5">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <Paperclip className="size-3.5" />
            Attachments
          </p>
          <ul className="mt-3 space-y-2">
            {attachments.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {file.file_name}
                </a>
                <span className="text-muted-foreground ml-2 text-xs">
                  ({Math.max(1, Math.round(file.file_size / 1024))} KB)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-border bg-card rounded-lg border p-5">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Comments
        </p>
        {comments.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">No comments yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-xs">{comment.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{comment.authorName}</span>{" "}
                    <span className="text-muted-foreground text-xs">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm">{comment.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <CommentForm bugId={bug.id} />
      </div>

      <div className="border-border bg-card rounded-lg border p-5">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <History className="size-3.5" />
          Activity
        </p>
        {activity.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">No activity yet.</p>
        ) : (
          <ul className="border-border relative mt-4 space-y-4 border-l pl-4">
            {activity.map((event) => (
              <li key={event.id} className="relative">
                <span className="bg-muted-foreground absolute top-1.5 -left-[21px] size-2 rounded-full" />
                <p className="text-sm">
                  {event.actorName} {event.action}
                  {event.detail ? `: ${event.detail}` : ""}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatRelativeTime(event.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
