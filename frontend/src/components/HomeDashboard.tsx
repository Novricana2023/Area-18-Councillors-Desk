"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, FileText, Megaphone, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ISSUE_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { IssueDto, TransparencyStatsDto } from "@/lib/types";
import { btnAccentClass, btnPrimaryClass, cardClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

function StatsSkeleton() {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function HomeDashboard() {
  const { user, isCouncillor } = useAuth();
  const [stats, setStats] = useState<TransparencyStatsDto | null>(null);
  const [myIssues, setMyIssues] = useState<IssueDto[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.displayName ?? user?.fullName?.split(" ")[0] ?? "there";

  useEffect(() => {
    Promise.all([
      api.transparency.getStats().catch(() => null),
      isCouncillor ? Promise.resolve([]) : api.issues.getMyIssues().catch(() => []),
    ]).then(([s, issues]) => {
      setStats(s);
      setMyIssues(issues ?? []);
    }).finally(() => setLoading(false));
  }, [isCouncillor]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-charcoal sm:text-3xl">Hello, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Welcome back to Area 18 Councillor&apos;s Desk — your ward coordination hub.
        </p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Community Issues" value={stats.totalIssues} icon={FileText} />
          <StatsCard title="Resolved" value={stats.resolvedIssues} icon={Search} />
          <StatsCard title="Resolution Rate" value={`${stats.resolutionRate.toFixed(0)}%`} icon={Bell} />
          <StatsCard title="Avg. Days to Resolve" value={stats.averageResolutionDays.toFixed(1)} icon={Megaphone} />
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap gap-3">
        {!isCouncillor && (
          <Link href="/issues/new" className={btnAccentClass + " gap-2"}>
            <Plus className="h-4 w-4" /> Report Issue
          </Link>
        )}
        <Link href="/issues" className={btnPrimaryClass + " gap-2"}>
          Community Issues <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/announcements" className={btnPrimaryClass + " gap-2 bg-navy/90"}>
          Announcements <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/issues/track" className={btnPrimaryClass + " gap-2 border border-border bg-white text-navy shadow-none hover:bg-muted"}>
          Track Issue
        </Link>
        {isCouncillor && (
          <Link href="/dashboard" className={btnPrimaryClass + " gap-2"}>
            Councillor Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {!isCouncillor && (
        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold text-charcoal">Your Reported Issues</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : myIssues.length === 0 ? (
            <p className="text-sm text-muted-fg">
              You haven&apos;t reported any issues yet.{" "}
              <Link href="/issues/new" className="font-medium text-navy underline">Report your first issue</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {myIssues.slice(0, 5).map((issue) => (
                <li key={issue.id}>
                  <Link href={`/issues/${issue.id}`} className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-3 transition hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-charcoal">{issue.title}</p>
                      <p className="text-xs text-muted-fg">
                        {issue.referenceNumber ? `#${issue.referenceNumber} · ` : ""}
                        {format(new Date(issue.createdAt), "PPP")}
                      </p>
                    </div>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_COLORS[issue.status])}>
                      {ISSUE_STATUS_LABELS[issue.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
