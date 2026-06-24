import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { RecentIssueSummaryDto } from "@/lib/types";
import { IssueStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardIssueSummaryRow({ issue }: { issue: RecentIssueSummaryDto }) {
  const isResolved = issue.status === IssueStatus.Resolved || issue.status === IssueStatus.Closed;

  return (
    <Link
      href={`/issues/${issue.id}`}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition hover:border-navy/30 hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_COLORS[issue.status])}>
            {ISSUE_STATUS_LABELS[issue.status]}
          </span>
          {issue.referenceNumber && (
            <span className="font-mono text-xs text-muted-fg">#{issue.referenceNumber}</span>
          )}
          {isResolved && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          )}
        </div>
        <p className="truncate font-medium text-charcoal">{issue.title}</p>
        <p className="text-xs text-muted-fg">
          {ISSUE_CATEGORY_LABELS[issue.category]}
          {issue.resolvedAt
            ? ` · Resolved ${format(new Date(issue.resolvedAt), "PP")}`
            : ` · Reported ${format(new Date(issue.createdAt), "PP")}`}
        </p>
      </div>
    </Link>
  );
}
