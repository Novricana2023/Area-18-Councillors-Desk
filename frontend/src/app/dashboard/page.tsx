"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Megaphone, Shield } from "lucide-react";
import { DashboardIssueSummaryRow } from "@/components/DashboardIssueSummaryRow";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatsCard } from "@/components/StatsCard";
import { api } from "@/lib/api";
import type { CouncillorDashboardDto } from "@/lib/types";
import { cardClass } from "@/lib/ui";

const REFRESH_MS = 15000;

export default function DashboardOverviewPage() {
  const [dashboard, setDashboard] = useState<CouncillorDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setDashboard(await api.dashboard.getStats());
    } catch {
      if (!silent) setDashboard(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), REFRESH_MS);
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  if (loading && !dashboard) return <LoadingSpinner className="py-20" />;

  if (!dashboard) {
    return <p className="text-sm text-muted-fg">Could not load dashboard. Check that the API is running.</p>;
  }

  const resolutionRate = dashboard.totalIssues > 0
    ? Math.round((dashboard.resolvedIssues / dashboard.totalIssues) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-fg">Live overview — refreshes every {REFRESH_MS / 1000}s and when you return to this tab.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Issues" value={dashboard.totalIssues} icon={FileText} />
        <StatsCard title="Open" value={dashboard.openIssues} icon={Megaphone} />
        <StatsCard title="Resolved" value={dashboard.resolvedIssues} icon={Shield} trend={`${resolutionRate}%`} />
        <StatsCard title="Unassigned" value={dashboard.unassignedIssues} icon={ArrowRight} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-charcoal">Needs Attention</h2>
          <Link href="/dashboard/issues" className="text-sm font-medium text-navy hover:underline">Manage all</Link>
        </div>
        {dashboard.needsAttentionIssues.length === 0 ? (
          <p className={cardClass + " text-sm text-muted-fg"}>No open issues — all caught up.</p>
        ) : (
          <div className="space-y-2">
            {dashboard.needsAttentionIssues.map((issue) => (
              <DashboardIssueSummaryRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Recently Resolved
          </h2>
          <Link href="/dashboard/issues" className="text-sm font-medium text-navy hover:underline">View all issues</Link>
        </div>
        {dashboard.recentlyResolvedIssues.length === 0 ? (
          <p className={cardClass + " text-sm text-muted-fg"}>No resolved issues yet.</p>
        ) : (
          <div className="space-y-2">
            {dashboard.recentlyResolvedIssues.map((issue) => (
              <DashboardIssueSummaryRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
