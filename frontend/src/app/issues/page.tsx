"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { BarChart3, Clock, List, Map, Search, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IssueCard } from "@/components/IssueCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { api } from "@/lib/api";
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS } from "@/lib/constants";
import type { IssueDto, TransparencyStatsDto } from "@/lib/types";
import { IssueCategory, IssueStatus } from "@/lib/types";
import { btnAccentClass, btnSecondaryClass, inputClass, selectClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

const AreaMap = dynamic(() => import("@/components/AreaMap").then((m) => m.AreaMap), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
});

const LIVE_REFRESH_MS = 10000;

function IssuesListContent() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [stats, setStats] = useState<TransparencyStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const fetchIssues = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [data, transparency] = await Promise.all([
        api.issues.search({
          query: query || undefined,
          category: category !== "" ? (Number(category) as IssueCategory) : undefined,
          status: status !== "" ? (Number(status) as IssueStatus) : undefined,
          pageSize: 50,
        }),
        api.transparency.getStats().catch(() => null),
      ]);
      setIssues(data);
      setStats(transparency);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, status]);

  useEffect(() => {
    fetchIssues(false);
    const interval = setInterval(() => fetchIssues(true), LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Community"
        subtitle="All reported issues, ward transparency, and public discussions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/issues/track" className={btnSecondaryClass}>
              Track Issue
            </Link>
            <Link href="/issues/new" className={btnAccentClass}>
              Report Issue
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-fg">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
        Live view — refreshes every {LIVE_REFRESH_MS / 1000}s
      </div>

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Issues" value={stats.totalIssues} icon={Search} />
          <StatsCard title="Resolved" value={stats.resolvedIssues} icon={Shield} />
          <StatsCard title="Resolution Rate" value={`${stats.resolutionRate.toFixed(0)}%`} icon={BarChart3} />
          <StatsCard title="Avg. Resolution" value={`${stats.averageResolutionDays.toFixed(1)}d`} icon={Clock} />
        </div>
      )}

      <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <input type="search" placeholder="Search issues…" value={query} onChange={(e) => setQuery(e.target.value)} className={inputClass + " pl-10"} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {Object.entries(ISSUE_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          {Object.entries(ISSUE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            view === "list" ? "bg-navy text-white" : "border border-border bg-card text-charcoal",
          )}
        >
          <List className="h-4 w-4" /> List
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            view === "map" ? "bg-navy text-white" : "border border-border bg-card text-charcoal",
          )}
        >
          <Map className="h-4 w-4" /> Map
        </button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : issues.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-fg">No issues found. Try adjusting your filters.</p>
      ) : view === "map" ? (
        <AreaMap issues={issues} height="h-[28rem]" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function IssuesPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSpinner className="min-h-[50vh]" />}>
        <IssuesListContent />
      </Suspense>
    </AppShell>
  );
}
