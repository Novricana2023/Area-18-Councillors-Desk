"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import type { ContentReportDto } from "@/lib/types";
import { btnPrimaryClass, btnSecondaryClass, sectionClass } from "@/lib/ui";

export default function DashboardModerationPage() {
  const [reports, setReports] = useState<ContentReportDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReports(await api.moderation.getReports());
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleReview(id: string, status: string) {
    try {
      await api.moderation.reviewReport(id, status);
      await load();
    } catch { /* ignore */ }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-charcoal">Content Reports</h2>
      {reports.length === 0 ? (
        <p className="text-sm text-muted-fg">No pending moderation reports.</p>
      ) : (
        reports.map((report) => (
          <article key={report.id} className={sectionClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-charcoal">{report.targetType} · {report.reason}</p>
                <p className="mt-1 text-sm text-muted-fg">Reported by {report.reporterName}</p>
                {report.details && <p className="mt-2 text-sm text-muted-fg">{report.details}</p>}
                <p className="mt-2 text-xs text-muted-fg">{format(new Date(report.createdAt), "PPP")} · Status: {report.status}</p>
              </div>
              {report.status === "Pending" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleReview(report.id, "Resolved")} className={btnPrimaryClass + " py-2 text-xs"}>Resolve</button>
                  <button type="button" onClick={() => handleReview(report.id, "Dismissed")} className={btnSecondaryClass + " py-2 text-xs"}>Dismiss</button>
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
